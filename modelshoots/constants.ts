import { Pose, Model } from './types';

export const MALE_POSES: Pose[] = [
  { id: 'm1', name: 'Contrapposto', imageUrl: 'https://picsum.photos/seed/m_contrapposto/300/400', description: 'A classic artistic pose where the body\'s weight is shifted onto one foot, creating a gentle S-curve. It looks relaxed yet structured, often conveying a sense of thoughtful composure.' },
  { id: 'm2', name: 'Hands in Pockets', imageUrl: 'https://picsum.photos/seed/m_pockets/300/400', description: 'A casual and confident pose where one or both hands are placed in the trouser pockets. It suggests a relaxed, easygoing attitude.' },
  { id: 'm3', name: 'Leaning Forward', imageUrl: 'https://picsum.photos/seed/m_lean/300/400', description: 'The model leans their upper body slightly forward, often resting elbows on knees or a table. This creates an engaging and intimate feel, drawing the viewer in.' },
  { id: 'm4', name: 'Crossed Arms', imageUrl: 'https://picsum.photos/seed/m_crossed/300/400', description: 'A common pose where the arms are folded across the chest. It can convey seriousness, authority, or a thoughtful, reserved demeanor depending on the facial expression.' },
  { id: 'm6', name: 'Sitting (Corporate)', imageUrl: 'https://picsum.photos/seed/m_sit/300/400', description: 'A formal seated pose with an upright posture, often with hands clasped or resting on the legs. It projects professionalism and confidence, suitable for business portraits.' },
  { id: 'm7', name: 'Confident Stance', imageUrl: 'https://picsum.photos/seed/m_confident/300/400', description: 'The model stands upright with solid, assured posture—shoulders squared, chin up, eyes forward. Hands may be on hips or relaxed by the sides. This pose projects boldness and self-assurance.' },
  { id: 'm8', name: 'Leaning Casual', imageUrl: 'https://picsum.photos/seed/m_leaning_casual/300/400', description: 'A relaxed pose, with the model leaning slightly (often on one leg or against a surface). Shoulders are loose, arms are comfortable, and facial expression is friendly or easygoing. The overall effect is informal and approachable.' },
  { id: 'm9', name: 'Action Shot', imageUrl: 'https://picsum.photos/seed/m_action/300/400', description: 'The model is captured mid-movement—running, jumping, turning, or in some form of dynamic action. Limbs are active, and there’s a sense of energy and spontaneity, making this pose lively and expressive.' },
  { id: 'm10', name: 'Sitting Thoughtful', imageUrl: 'https://picsum.photos/seed/m_sitting_thoughtful/300/400', description: 'The model sits with a contemplative attitude—head slightly tilted, gaze downward or off to the side, perhaps a hand resting on their chin or cheek. The mood is introspective and gentle.' },
  { id: 'm11', name: 'Heroic Profile', imageUrl: 'https://picsum.photos/seed/m_heroic/300/400', description: 'The model is turned sideways, presenting a strong profile with chin raised, chest forward, and eyes set on the horizon (or slightly upward). This pose is dramatic and dignified, often conveying ambition or determination.' },
  { id: 'm12', name: 'Walking Forward', imageUrl: 'https://picsum.photos/seed/m_walking_forward/300/400', description: 'The model is in stride, one foot ahead of the other, arms moving naturally as if walking. Their gaze may be straight ahead or slightly to the side. The pose is dynamic, stylish, and confident.' },
  { id: 'm13', name: 'Jacket Over Shoulder', imageUrl: 'https://picsum.photos/seed/m_jacket/300/400', description: 'A classic cool pose—model holds or drapes a jacket over their shoulder, either with one hand or simply letting it hang. The body posture is relaxed, and the vibe is stylish and nonchalant.' },
  { id: 'm14', name: 'Looking Away', imageUrl: 'https://picsum.photos/seed/m_looking_away/300/400', description: 'The model’s head is turned slightly off-center, gazing away from the camera. The pose can signify pensiveness, mystery, or casual indifference, with a soft or neutral facial expression.' },
];

export const FEMALE_POSES: Pose[] = [
  { id: 'f1', name: 'Power Stance', imageUrl: 'https://picsum.photos/seed/f_power/300/400', description: 'A confident and strong pose with shoulders back, feet apart, and a direct gaze towards the camera.' },
  { id: 'f2', name: 'Hip Pop', imageUrl: 'https://picsum.photos/seed/f_hip/300/400', description: 'A classic pose where one hip is pushed out to the side, creating an S-curve with the body. It conveys a playful and confident attitude.' },
  { id: 'f3', name: 'Hands in Hair', imageUrl: 'https://picsum.photos/seed/f_hair/300/400', description: 'Model casually runs hands through their hair, creating a sense of movement and intimacy. Can be playful or seductive.' },
  { id: 'f4', name: 'Wall Lean', imageUrl: 'https://picsum.photos/seed/f_wall/300/400', description: 'Casually leaning against a surface, creating a relaxed and cool demeanor. The body is angled and one leg might be bent.' },
  { id: 'f5', name: 'Over-the-Shoulder', imageUrl: 'https://picsum.photos/seed/f_shoulder/300/400', description: 'The model looks back over their shoulder towards the camera, creating a dynamic and slightly mysterious look.' },
  { id: 'f6', name: 'Elongated Stretch', imageUrl: 'https://picsum.photos/seed/f_stretch/300/400', description: 'A graceful pose involving reaching or stretching the limbs to create long, elegant lines with the body.' },
  { id: 'f7', name: 'Elegant Turn', imageUrl: 'https://picsum.photos/seed/f_elegant_turn/300/400', description: 'The model gracefully twists their body, possibly turning the shoulders or hips away from the camera while keeping the head turned toward it. The movement suggests poise and flow, often used to highlight garments or create a sense of motion.' },
  { id: 'f9', name: 'Candid Laughter', imageUrl: 'https://picsum.photos/seed/f_laughter/300/400', description: 'The model is captured in a natural, joyful moment, laughing spontaneously. Eyes may be partially closed, head slightly back, and body relaxed. This pose feels energetic and relatable, evoking genuine emotion and authenticity.' },
  { id: 'f10', name: 'Sitting Graceful', imageUrl: 'https://picsum.photos/seed/f_sitting/300/400', description: 'The subject is seated elegantly, with straight or slightly arched posture. Legs are crossed or positioned delicately, hands resting in the lap or on the armrest. This pose highlights sophistication, composure, and femininity.' },
  { id: 'f11', name: 'Dynamic Movement', imageUrl: 'https://picsum.photos/seed/f_dynamic/300/400', description: 'The model is shown in action, either walking, jumping, turning, or making an expressive gesture. The energy is high, with flowing hair or fabric, limbs extended, and a sense of momentum captured in the frame.' },
  { id: 'f12', name: 'Soft Gaze', imageUrl: 'https://picsum.photos/seed/f_soft_gaze/300/400', description: 'The subject softly looks away from the camera, eyes gentle and serene. The expression is relaxed, conveying calmness, vulnerability, or a dreamy mood. This pose is often used for intimate, emotional portraits.' },
];

export const MALE_MODELS: Model[] = [
  { id: 'sm1', name: 'Ethan', imageUrl: 'https://picsum.photos/seed/model_ethan/400/600' },
  { id: 'sm2', name: 'Leo', imageUrl: 'https://picsum.photos/seed/model_leo/400/600' },
  { id: 'sm3', name: 'Caleb', imageUrl: 'https://picsum.photos/seed/model_caleb/400/600' },
  { id: 'sm4', name: 'Javier', imageUrl: 'https://picsum.photos/seed/model_javier/400/600' },
  { id: 'sm5', name: 'Marcus', imageUrl: 'https://picsum.photos/seed/model_marcus/400/600' },
  { id: 'sm6', name: 'Owen', imageUrl: 'https://picsum.photos/seed/model_owen/400/600' },
];

export const FEMALE_MODELS: Model[] = [
  { id: 'sf1', name: 'Ava', imageUrl: 'https://picsum.photos/seed/model_ava/400/600' },
  { id: 'sf2', name: 'Chloe', imageUrl: 'https://picsum.photos/seed/model_chloe/400/600' },
  { id: 'sf3', name: 'Isabelle', imageUrl: 'https://picsum.photos/seed/model_isabelle/400/600' },
  { id: 'sf4', name: 'Maya', imageUrl: 'https://picsum.photos/seed/model_maya/400/600' },
  { id: 'sf5', name: 'Sophia', imageUrl: 'https://picsum.photos/seed/model_sophia/400/600' },
  { id: 'sf6', name: 'Zoe', imageUrl: 'https://picsum.photos/seed/model_zoe/400/600' },
];

export const MAX_POSES = 6;
export const MAX_ACCESSORIES = 5;