const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Permite que seu index.html acesse este servidor de qualquer lugar
app.use(cors());
app.use(express.json());

// --- BANCO DE DADOS (Na Memória RAM) ---
// Como é um Web Service no Render, essa variável persiste enquanto o servidor estiver "acordado".
// Se o servidor reiniciar, ele volta para o estado inicial.
let memoryDB = [
    { id: 1, date: new Date().toISOString(), content: "Sistema Neural iniciado." }
];

// --- ROTAS DA API ---

// 1. Rota de "Ping" (Acordar o servidor)
// O index.html chama isso assim que abre.
app.get('/wake-up', (req, res) => {
    console.log("Servidor acordado pelo NeuralOS!");
    res.json({ status: "acordado", message: "Estou pronto." });
});

// 2. Salvar Memória (POST)
app.post('/memories', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Conteúdo vazio" });

    const newEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        content: content
    };

    // Adiciona no topo da lista (mais recente primeiro)
    memoryDB.unshift(newEntry);
    
    // Limite de segurança para não estourar a RAM do plano free
    if (memoryDB.length > 500) memoryDB.pop(); 

    console.log(`Nova memória salva: ${content}`);
    res.json({ success: true, entry: newEntry });
});

// 3. Ler/Buscar Memória (GET)
app.get('/memories', (req, res) => {
    const { search } = req.query;
    
    if (search) {
        const term = search.toLowerCase();
        // Busca simples por texto
        const results = memoryDB.filter(m => 
            m.content.toLowerCase().includes(term)
        ).slice(0, 5); // Retorna top 5 resultados relevantes
        return res.json(results);
    }
    
    // Se não tiver busca, retorna as 20 últimas memórias
    res.json(memoryDB.slice(0, 20));
});

// 4. Deletar Memória (DELETE)
app.delete('/memories/:id', (req, res) => {
    const id = parseInt(req.params.id);
    memoryDB = memoryDB.filter(m => m.id !== id);
    res.json({ success: true });
});

// Iniciar o Servidor
app.listen(port, () => {
    console.log(`NeuralOS API rodando na porta ${port}`);
});
