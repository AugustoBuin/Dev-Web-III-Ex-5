import { Schema, model } from "mongoose";

export interface Discos {
    titulo: string;
    artista: string;
    ano: number;
    genero: string;
    formato: "vinil" | "cd";
    preco: number;
}

const DiscoSchema = new Schema<Discos>(
    {
        titulo: { type: String, required: true },
        artista: { type: String, required: true },
        ano: { type: Number, required: true },
        genero: { type: String, required: true },
        formato: { type: String, enum: ["vinil", "cd"], required: true },
        preco: { type: Number, required: true }
    },
    { timestamps: true }
);

export default model<Discos>("Disco", DiscoSchema);
