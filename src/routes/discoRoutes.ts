import { Router } from "express";
import DiscoModel from "../models/Disco";

const router = Router();

// Listar todos
router.get("/", async (_req, res) => {
    const discos = await DiscoModel.find().sort({ createdAt: -1 });
    res.json(discos);
});

// Criar
router.post("/", async (req, res) => {
    try {
        const disco = await DiscoModel.create(req.body);
        res.status(201).json(disco);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Atualizar (carrega no form pelo front e envia PUT)
router.put("/:id", async (req, res) => {
    try {
        const disco = await DiscoModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!disco) return res.status(404).json({ error: "Não encontrado" });
        res.json(disco);
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});

// Excluir (com confirmação no front)
router.delete("/:id", async (req, res) => {
    const deleted = await DiscoModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Não encontrado" });
    res.status(204).send();
});

export default router;
