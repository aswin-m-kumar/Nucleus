from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from core.config import settings
from routers import sheets, goals, admin, users, cycles

app = FastAPI(title="Nucleus — Goal Setting & Tracking Portal")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(sheets.router)
app.include_router(goals.router)
app.include_router(admin.router)
app.include_router(users.router)
app.include_router(cycles.router)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc), "code": "INTERNAL_SERVER_ERROR"},
    )

@app.get("/")
async def root():
    return {"message": "Goal Setting & Tracking Portal API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
