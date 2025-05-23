const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

const alunosPath = path.join(__dirname, 'alunos.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const alunosData = fs.readFileSync(alunosPath, 'utf-8');
const alunos = JSON.parse(alunosData)


function salvarDados(alunos) {
    fs.writeFileSync(alunosPath, JSON.stringify(alunos, null, 2));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Inicio.html'))
})

app.get('/listar-alunos', (req, res) => {
    res.send(`
        <h1>Lista dos alunos</h1>
        <pre>${JSON.stringify(alunos, null, 2)}</pre>
        <button><a href="/">Voltar</a></button>
        `);
});

app.get('/matricular-aluno', (req, res) => {
    res.sendFile(path.join(__dirname, 'MatricularAluno.html'))
});

app.post('/matricular-aluno', (req, res) => {
    const novoaluno = req.body;

    if (alunos.find(alunos => alunos.nome.toLowerCase() === novoaluno.nome.toLowerCase())) {
        res.send('<h1>Aluno já matriculado. Não é possível matricular o mesmo aluno.</h1><button><a href="/">Voltar</a></button>');
        return;
    }

    alunos.push(novoaluno);
    salvarDados(alunos);
    res.send('<h1>Aluno matriculado com sucesso!</h1><button><a href="/">Voltar</a></button>');
});

app.get('/atualizar-aluno', (req, res) => {
    res.sendFile(path.join(__dirname, 'AtualizarAluno.html'));
});

app.post('/atualizar-aluno', (req, res) => {
    const { nome, novaSala, novoNumero, novaMateriaFav, novoSexo } = req.body

    const alunosIndex = alunos.findIndex(aluno => aluno.nome.toLowerCase() === nome.toLowerCase());

    if (alunosIndex === -1) {
        res.send(`<h1>Aluno não encontrado.</h1><button><a href="/atualizar-aluno">Voltar</a></button>`);
        return;
    }

    alunos[alunosIndex].sala = novaSala;
    alunos[alunosIndex].numero = novoNumero;
    alunos[alunosIndex].materiaFav = novaMateriaFav;
    alunos[alunosIndex].sexo = novoSexo;

    salvarDados(alunos);

    res.send(`<h1>Dados do aluno atualizados com sucesso!</h1><button><a href="/">Voltar</a></button>`);
});

app.get('/excluir-aluno', (req, res) => {
    res.sendFile(path.join(__dirname, 'ExcluirAluno.html'))
});

app.post('/excluir-aluno', (req, res) => {
    const { nome } = req.body;

    const alunosIndex = alunos.findIndex(alunos => alunos.nome.toLowerCase() === nome.toLowerCase());

    if (alunosIndex === -1) {
        res.send(`<h1>Aluno não encontrado.</h1><button><a href="/excluir-aluno">Voltar</a></button>`);
        return;
    }

    res.send(`
        <script>
            if (confirm('Tem certeza de que deseja retirar o aluno ${nome}?')) {
                window.location.href = '/excluir-aluno-confirmado?nome=${nome}';
            } else {
                window.location.href = '/excluir-aluno';
            }
        </script>
    `);
});

app.get('/excluir-aluno-confirmado', (req, res) => {
    const nome = req.query.nome;

    const alunosIndex = alunos.findIndex(aluno => aluno.nome.toLowerCase() === nome.toLowerCase());

    alunos.splice(alunosIndex, 1);

    salvarDados(alunos);

    res.send(`<h1> O aluno ${nome} foi excluído com sucesso!</h1><button><a href="/">Voltar</a></button>`);
});

app.get('/buscar-aluno', (req, res) => {
    res.sendFile(path.join(__dirname, 'BuscarAluno.html'))
});

app.get('/buscar-aluno/nome', (req, res) => {
    const nomeDoAlunosBuscado = req.query.nome;

    if (!nomeDoAlunosBuscado) {
        return res.send(`
            <h1>Por favor, insira um nome de um aluno.</h1>
            <form action="/buscar-aluno" method="get">
                <label for="nome">Nome do aluno:</label>
                <input type="text" name="nome" id="nome" required />
                <button type="submit">Buscar aluno</button>
            </form>
        `);
    }

    function BuscarAlunosPorNome(nome) {
        return alunos.find(aluno => aluno.nome.toLowerCase() === nome.toLowerCase());
    }

    const alunoEncontrado = BuscarAlunosPorNome(nomeDoAlunosBuscado);

    if (alunoEncontrado) {
        res.send(`<h1>Aluno Encontrado:</h1><pre>${JSON.stringify(alunoEncontrado, null, 2)}</pre>
        <button><a href="/buscar-aluno">Voltar</a></button>`);
    } else {
        res.send(`
            <h1>Aluno não Encontrado.</h1>
            <button><a href="/buscar-aluno">Voltar</a></button>`);
    }
});

app.get('/buscar-aluno/numero', (req, res) => {
    const numeroDoAlunosBuscado = req.query.numero;

    if (!numeroDoAlunosBuscado) {
        return res.send(`
            <h1>Por favor, insira um numero de um aluno.</h1>
            <form action="/buscar-aluno" method="get">
                <label for="numero">numero do aluno:</label>
                <input type="text" name="numero" id="numero" required />
                <button type="submit">Buscar aluno</button>
            </form>
        `);
    }

    function BuscarAlunosPornumero(numero) {
        return alunos.find(aluno => parseFloat(aluno.numero) === parseFloat(numero));
    }

    const alunoEncontrado = BuscarAlunosPornumero(numeroDoAlunosBuscado);

    if (alunoEncontrado) {
        res.send(`<h1>Aluno Encontrado:</h1><pre>${JSON.stringify(alunoEncontrado, null, 2)}</pre>
        <button><a href="/buscar-aluno">Voltar</a></button>`);
    } else {
        res.send(`
            <h1>Aluno não Encontrado.</h1>
            <button><a href="/buscar-aluno">Voltar</a></button>`);
    }
});

app.listen(port, () => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
});
