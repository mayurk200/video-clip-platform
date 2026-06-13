from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.reframing.vertical_reframer import reframe_to_vertical
from app.hooks.generator import generate_hooks

router = APIRouter()


class RenderRequest(BaseModel):
    clip_path: str
    caption_style: Optional[str] = "hormozi"
    aspect_ratio: Optional[str] = "9:16"
    layout_mode: Optional[str] = "auto"
    captions: Optional[List[Dict]] = None


class HookRequest(BaseModel):
    text: str


@router.post("/render")
def render_clip(request: RenderRequest):
    """Render a clip with vertical reframing."""
    try:
        output_path = request.clip_path.replace(".mp4", "_rendered.mp4")
        reframe_to_vertical(request.clip_path, output_path, layout_mode=request.layout_mode)

        return {
            "output_path": output_path,
            "thumbnail_path": None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/hooks/generate")
async def generate_hooks_route(request: HookRequest):
    """Generate viral hooks from opening text."""
    try:
        hooks = generate_hooks(request.text)
        return {"hooks": hooks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
