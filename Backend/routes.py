from fastapi import Query, HTTPException, APIRouter, Depends, Response, Request, status
from models import LoanApplication, CIBILScoreRequest, UserLogin, UserSignup
from utils.chatbot_utils import chain
from utils.loan_predictor_utils import get_explanation, predict_with_shap
from utils.cibil_utils import get_improvement_suggestions, CIBILScoreCalculator
from db import store_refresh_token, get_refresh_token, delete_refresh_token, users_collection
from auth import verify_password, create_access_token, create_refresh_token, get_current_user, SECRET_KEY, ALGORITHM, REFRESH_TOKEN_EXPIRE_DAYS, pwd_context
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

@router.post("/predict")
async def predict_loan_approval(data: LoanApplication, user=Depends(get_current_user)):
    try: 
        prediction, shap_dict = await predict_with_shap(data)
        explanation = await get_explanation(shap_dict, True if prediction > 0.5 else False)

        return {
            "approve_chances": round(prediction * 100, 2),
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
        improvement_suggestions = await get_improvement_suggestions(score, contributions)
        
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

@router.post("/chat")
async def chat(request, query: str = Query(..., title="Search Query"), user=Depends(get_current_user)):
    try:
        response = await chain.ainvoke(query)
        return {"answer": response.content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
