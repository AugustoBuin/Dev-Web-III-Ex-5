import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import discoRoutes from "./routes/discoRoutes";

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const app = express();

app.use(cors());
app.use(express.json());

// servir o front simples (estático)
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// rota de saúde (opcional)
app.get("/health", (_req, res) => {
    const state = mongoose.connection.readyState; // 1=connected, 2=connecting
    res.json({ ok: true, mongoState: state });
});

// *** CONEXÃO COM ATLAS ***
async function bootstrap() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error("Faltou MONGODB_URI no .env");
        return; // não derruba o processo
    }

    // Log sanitizado (sem credenciais), só pra validar que o .env foi lido
    console.log("Conectando em:", uri.replace(/\/\/.*@/, "//***:***@"));

    // conectar ao MongoDB Atlas
    await mongoose.connect(uri, {
        dbName: "dweb3",
        serverSelectionTimeoutMS: 15000
    });

    console.log("MongoDB Atlas conectado");
    app.use("/discos", discoRoutes);
    app.listen(3000, () => console.log("Servidor: http://localhost:3000"));
}


bootstrap();
