import json
import main

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/getresponse/")
async def model(
    model: str = Form(...),
    prompt: str = Form(...),
    history: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
):
    image_bytes = None
    image_text = None
    if image_file:
        image_bytes = await image_file.read()
        image_text = extract_text(image_bytes)

    parsed_history = json.loads(history) if history else []

    return main.get_response(
        model_name=model,
        input_prompt=prompt,
        image_text=image_text,
        history=parsed_history,
        image_bytes=image_bytes
    ).content
