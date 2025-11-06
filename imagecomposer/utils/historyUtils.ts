import { CompositionState, SerializableCompositionState, FileWithPreview, SerializableFile, Accessory, SerializableAccessory } from '../types';
import { fileToDataUrl } from './fileUtils';

// Helper to convert a single FileWithPreview to a SerializableFile
async function toSerializableFile(file: FileWithPreview): Promise<SerializableFile> {
  const dataUrl = await fileToDataUrl(file);
  return { dataUrl, name: file.name };
}

// Converts the entire app state to a format that can be saved in localStorage
export async function stateToSerializable(state: CompositionState): Promise<SerializableCompositionState> {
  const serializableSubjects = await Promise.all(state.subjects.map(toSerializableFile));
  
  const serializableBackgroundFile = state.background.file
    ? await toSerializableFile(state.background.file)
    : undefined;

  const serializableClothingFile = state.clothing.file
    ? await toSerializableFile(state.clothing.file)
    : undefined;
    
  // FIX: Destructure accessory to handle incompatible `file` types safely.
  // This avoids unsafe casting or spreading properties with conflicting types.
  const serializableAccessories = await Promise.all(
    state.accessories.map(async (acc): Promise<SerializableAccessory> => {
      const { file, ...rest } = acc;
      if (acc.type === 'upload' && file) {
        return { ...rest, file: await toSerializableFile(file) };
      }
      return rest;
    })
  );

  return {
    ...state,
    subjects: serializableSubjects,
    background: { ...state.background, file: serializableBackgroundFile },
    clothing: { ...state.clothing, file: serializableClothingFile },
    accessories: serializableAccessories,
  };
}

// Helper to convert a single SerializableFile back to a FileWithPreview-like object
// This creates a "mock" File object, as we can't reconstruct a real one from a data URL.
// However, it has all the properties our app uses (`preview`, `name`, `type`).
function fromSerializableFile(sf: SerializableFile): FileWithPreview {
  // Extract mime type from data URL, e.g., 'data:image/png;base64,...' -> 'image/png'
  const mimeType = sf.dataUrl.substring(sf.dataUrl.indexOf(':') + 1, sf.dataUrl.indexOf(';'));
  
  // Create a mock File object. The content is empty, but this is okay because
  // our modified `fileToBase64` function will use the dataUrl from `preview`.
  const mockFile = new File([], sf.name, { type: mimeType });

  return Object.assign(mockFile, {
    preview: sf.dataUrl
  });
}


// Converts a state from localStorage back into the format the app uses
export function serializableToState(serializable: SerializableCompositionState): CompositionState {
  const subjects = serializable.subjects.map(fromSerializableFile);
  
  const backgroundFile = serializable.background.file
    ? fromSerializableFile(serializable.background.file)
    : undefined;

  const clothingFile = serializable.clothing.file
    ? fromSerializableFile(serializable.clothing.file)
    : undefined;
    
  // FIX: Destructure accessory to handle incompatible `file` types safely.
  // This mirrors the fix in `stateToSerializable` for deserialization.
  const accessories: Accessory[] = serializable.accessories.map((acc) => {
    const { file, ...rest } = acc;
    if (acc.type === 'upload' && file) {
      return { ...rest, file: fromSerializableFile(file) };
    }
    return rest;
  });

  return {
    ...serializable,
    subjects,
    background: { ...serializable.background, file: backgroundFile },
    clothing: { ...serializable.clothing, file: clothingFile },
    accessories,
  };
}