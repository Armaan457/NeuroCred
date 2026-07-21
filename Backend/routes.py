from fastapi import Query, HTTPException, APIRouter, Depends, Response, Request, status
from models import LoanApplication, CIBILScoreRequest, UserLogin, UserSignup, PasswordResetRequest, PasswordResetConfirm
from utils.chatbot_utils import chain
from utils.loan_predictor_utils import get_explanation, predict_with_shap
from utils.cibil_utils import get_improvement_suggestions, CIBILScoreCalculator
from utils.email_utils import send_reset_password_email
from db import store_refresh_token, get_refresh_token, delete_refresh_token, users_collection, loan_history_collection, cibil_history_collection
from auth import verify_password, create_access_token, create_refresh_token, get_current_user, SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, pwd_context, create_password_reset_token
from datetime import datetime, timezone
from jose import JWTError, jwt

router = APIRouter()

calculator = CIBILScoreCalculator()

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserSignup):
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(user.password)

    new_user = {
        "full_name": user.full_name,
        "email": user.email,
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc)
    }

    result = await users_collection.insert_one(new_user)
    created_user = await users_collection.find_one({"_id": result.inserted_id})

    return {
        "id": str(created_user["_id"]),
        "full_name": created_user["full_name"],
        "email": created_user["email"]
    }

@router.post("/login")
async def login(user: UserLogin, response: Response):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    user_id = str(db_user["_id"])
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    await store_refresh_token(user_id, refresh_token)

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="strict",
        secure=False,   
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh")
async def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    stored_token = await get_refresh_token(user_id)
    if stored_token != refresh_token:
        raise HTTPException(status_code=401, detail="Token mismatch or expired")

    new_access_token = create_access_token({"sub": user_id})
    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(request: Request, response: Response, user=Depends(get_current_user)):
    await delete_refresh_token(str(user["_id"]))
    response.delete_cookie("refresh_token")
    return {"msg": "Logged out"}


@router.post("/request-password-reset")
async def request_password_reset(request: PasswordResetRequest):
    user = await users_collection.find_one({"email": request.email})
    

    if user:
        reset_token = create_password_reset_token(user["email"])
        try:
            await send_reset_password_email(user["email"], reset_token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email: {str(e)}"
            )

    return {
        "message": "If an account with that email exists, a password reset link has been sent."
    }

@router.post("/reset-password")
async def reset_password(data: PasswordResetConfirm):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "reset_password":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid reset token"
            )
            
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid token payload"
            )
            
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Token has expired or is invalid"
        )

    hashed_password = pwd_context.hash(data.new_password)
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )

    return {"message": "Password successfully updated. You can now log in with your new password."}


@router.post("/predict")
async def predict_loan_approval(data: LoanApplication, user=Depends(get_current_user)):
    try: 
        prediction, shap_dict = await predict_with_shap(data)
        input_data = data.model_dump() if hasattr(data, "model_dump") else data.model_dump()
        explanation = await get_explanation(input_data, shap_dict, prediction)

        approve_chances = round(prediction * 100, 2)

        history_record = {
            "user_id": str(user["_id"]),
            "inputs": input_data,
            "outputs": {
                "approve_chances": approve_chances,
                "shap_values": shap_dict,
                "reason": explanation
            },
            "created_at": datetime.now(timezone.utc)
        }
        await loan_history_collection.insert_one(history_record)

        return {
            "approve_chances": approve_chances,
            "shap_values": shap_dict,
            "reason": explanation
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/calculate_cibil")
async def calculate_cibil(request: CIBILScoreRequest, user=Depends(get_current_user)):
    try:
        score, contributions = calculator.calculate_score(request)
        input_data = request.model_dump() if hasattr(request, "model_dump") else request.model_dump()
        improvement_suggestions = await get_improvement_suggestions(input_data, score, contributions)
        
        history_record = {
            "user_id": str(user["_id"]),
            "inputs": input_data,
            "outputs": {
                "cibil_score": score,
                "breakdown": contributions,
                "suggestions": improvement_suggestions
            },
            "created_at": datetime.now(timezone.utc)
        }
        await cibil_history_collection.insert_one(history_record)

        return {
            "CIBIL Score": score,
            "Breakdown": contributions,
            "Suggestions": improvement_suggestions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/history/loan")
async def get_loan_history(user=Depends(get_current_user)):
    try:
        user_id = str(user["_id"])
        cursor = loan_history_collection.find({"user_id": user_id}).sort("created_at", -1)
        history = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            history.append(doc)
        return {"loan_history": history}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/history/cibil")
async def get_cibil_history(user=Depends(get_current_user)):
    try:
        user_id = str(user["_id"])
        cursor = cibil_history_collection.find({"user_id": user_id}).sort("created_at", -1)
        history = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            history.append(doc)
        return {"cibil_history": history}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/chat")
async def chat(query: str = Query(..., title="Search Query"), user=Depends(get_current_user)):
    try:
        response = await chain.ainvoke(query)
        return {"answer": response.content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
