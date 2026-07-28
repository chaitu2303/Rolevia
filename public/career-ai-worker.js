// Web Worker: Runs the AI model entirely in the browser
// This file must be in /public to be accessible as a worker

import { pipeline, env } from '@xenova/transformers';

// Disable local model check — always fetch from HuggingFace CDN
env.allowLocalModels = false;

let generator = null;

self.addEventListener('message', async (event) => {
  const { type, payload } = event.data;

  if (type === 'LOAD_MODEL') {
    try {
      self.postMessage({ type: 'MODEL_LOADING', progress: 0 });

      generator = await pipeline(
        'text2text-generation',
        'Xenova/LaMini-Flan-T5-248M',
        {
          progress_callback: (progress) => {
            if (progress.status === 'downloading') {
              const pct = Math.round((progress.loaded / progress.total) * 100);
              self.postMessage({ type: 'MODEL_LOADING', progress: pct, file: progress.file });
            } else if (progress.status === 'done') {
              self.postMessage({ type: 'MODEL_LOADING', progress: 100 });
            }
          }
        }
      );

      self.postMessage({ type: 'MODEL_READY' });
    } catch (err) {
      self.postMessage({ type: 'MODEL_ERROR', error: err.message });
    }
  }

  if (type === 'GENERATE') {
    if (!generator) {
      self.postMessage({ type: 'ERROR', error: 'Model not loaded yet' });
      return;
    }

    try {
      const { prompt } = payload;
      const output = await generator(prompt, {
        max_new_tokens: 300,
        temperature: 0.7,
        repetition_penalty: 1.3,
        do_sample: true,
      });

      const text = output[0]?.generated_text || '';
      self.postMessage({ type: 'RESULT', text });
    } catch (err) {
      self.postMessage({ type: 'ERROR', error: err.message });
    }
  }
});
