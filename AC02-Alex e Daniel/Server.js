const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const port = 3000;

const AgendasPath = path.join(__dirname, 'Agendas.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const AgendasData = fs.readFileSync(AgendasPath, 'utf-8');
const Agendas = JSON.parse(AgendasData)

function SalvarDados(Agendas) {
    fs.writeFileSync(AgendasPath, JSON.stringify(Agendas, null, 2));
}

function TruncarDescricao(descricao, ComprimentoMaximo) {
    if (descricao.length > ComprimentoMaximo) {
        return descricao.slice(0, ComprimentoMaximo) + '...';
    }
    return descricao
}

app.get('/', (req, res) => {
    let AgendasTable = '';

    Agendas.forEach(agenda => {
        const DescricaoTruncada = TruncarDescricao(agenda.descricao, 100);
        AgendasTable += `
        <tr>
            <td><a href="/excluir-agendas">Excluir</a></td>
            <td>${agenda.titulo}</td>
            <td>${agenda.disciplina}</td>
            <td>${DescricaoTruncada}</td>
            <td>${agenda.dataEntrega}</td>
            <td><a href="/atualizar-agendas">Editar</a></td>
        </tr>
        `;
    });

    const htmlContent = fs.readFileSync('Inicio.html', 'utf-8');
    const finalHtml = htmlContent.replace('{{AgendasTable}}', AgendasTable);

    res.send(finalHtml); 
});

app.get('/inserir-agendas', (req, res) => {
    res.sendFile(path.join(__dirname, 'InserirAgendas.html'))
});

app.post('/inserir-agendas', (req, res) => {
    const NovoArtigo = req.body;

    if (Artigos.find(Artigos => Artigos.nome.toLowerCase() === NovoArtigo.nome.toLowerCase())) {
        res.send(`<h1>Agenda já existe. Não é possível adicionar duplicatas.</h1><button><a href="/">Voltar</a></button>`);
    }

    Artigos.push(NovoArtigo);
    SalvarDados(Artigos);
    res.send(`<h1>Agenda adicionado com sucesso!</h1><button><a href="/inserir-agendas">Voltar</a></button>`);
});

app.get('/atualizar-agendas', (req, res) => {
    res.sendFile(path.join(__dirname, 'AtualizarAgendas.html'))
});

app.post('/atualizar-agendas', (req, res) => {
    const { titulo, NovaDescricao, NovaDisciplina, NovaDataEntrega } = req.body

    const AgendasIndex = Agendas.findIndex(Agenda => Agenda.titulo.toLowerCase() === titulo.toLowerCase());

    if (AgendasIndex === -1) {
        res.send(`<h1>Agenda não encontrada.</h1><button><a href="/atualizar-agendas">Voltar</a></button>`);
        return;
    }

    Agendas[AgendasIndex].descricao = NovaDescricao
    Agendas[AgendasIndex].disciplina = NovaDisciplina
    Agendas[AgendasIndex].dataEntrega = NovaDataEntrega

    SalvarDados(Agendas);
    res.send(`<h1>Dados da Agenda atualizados com sucesso!</h1><button><a href="/atualizar-jogos">Volar</a></button>`);
});

app.get('/excluir-agendas', (req, res) => {
    res.sendFile(path.join(__dirname, 'ExcluirAgenda.html'));
});

app.post('/excluir-agendas', (req, res) =>{
    const { titulo } = req.body;

    const AgendasIndex = Agendas.findIndex(agenda => agenda.titulo.toLowerCase() === titulo.toLowerCase());

    if (AgendasIndex === -1) {
        res.send(`<h1>Agenda não encontrada.</h1>`);
        return;
    }

    res.send(`
        <script>
          if (confirm('Tem certeza de que deseja excluir a Agenda ${titulo}?')) {
            window.location.href = '/excluir-agendas-confirmado?titulo=${titulo}';
          } else {
            window.location.href = '/excluir-agendas';
          }
        </script>
    `);
});

app.get('/excluir-agendas-confirmado', (req, res) => {
    const titulo = req.query.nome;

    const AgendasIndex = Agendas.findIndex(agenda => agenda.titulo.toLowerCase() === titulo.toLocaleLowerCase());

    Agendas.splice(AgendasIndex, 1);

    SalvarDados(Agendas);
    res.send(`<h1>A Agenda ${titulo} foi excluido com sucesso!</h1>`);
});

app.listen(port, () => {
    console.log(`Servidor Iniciando em http://localhost:${port}`);
});