import vine from "@vinejs/vine"

export const registerSchema = vine.object({
    email:vine.string().email(),
    password:vine.string().minLength(6).maxLength(100).confirmed,
});