import { Action } from '@app/constants';
import { ScreenFrameTemplate } from 'shared/templates';

export const setScreenFrame = (frame: ScreenFrameTemplate) => ({
  type: Action.SCREEN_SET_FRAME,
  payload: frame,
});

export const resetFps = () => ({
  type: Action.SCREEN_RESET_FPS,
});
