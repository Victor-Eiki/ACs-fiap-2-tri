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
  const filtro = req.query.disciplina;
  let AgendasFiltradas = Agendas;

  if (filtro) {
    AgendasFiltradas = Agendas.filter(agenda =>
      agenda.disciplina.toLowerCase().includes(filtro.toLowerCase())
    );
  }

  let AgendasTable = '';

  AgendasFiltradas.forEach(agenda => {
    const DescricaoTruncada = TruncarDescricao(agenda.descricao, 100);
    const tituloEncoded = encodeURIComponent(agenda.titulo);

    AgendasTable += `
      <tr>
        <td>
          <a href="/excluir-agendas-confirmado?titulo=${tituloEncoded}" onclick="return confirm('Tem certeza que deseja excluir a agenda "${agenda.titulo}"?')">
            Excluir
          </a>
        </td>
        <td>${agenda.titulo}</td>
        <td>${agenda.disciplina}</td>
        <td>${DescricaoTruncada}</td>
        <td>${agenda.dataEntrega}</td>
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
    const NovaAgenda = req.body;

    if (Agendas.find(a => a.titulo.toLowerCase() === NovaAgenda.titulo.toLowerCase())) {
        return res.send(`<h1>Agenda já existe.</h1><a href="/">Voltar</a>`);
    }

    Agendas.push(NovaAgenda);
    SalvarDados(Agendas);
    res.send(`<h1>Agenda adicionada com sucesso!</h1><a href="/">Voltar</a>`);
});

app.get('/atualizar-agendas', (req, res) => {
    res.sendFile(path.join(__dirname, 'AtualizarAgendas.html'))
});

app.post('/atualizar-agendas', (req, res) => {
    const { titulo, NovaDescricao, NovaDisciplina, NovaDataEntrega } = req.body;

    const AgendasIndex = Agendas.findIndex(agenda => agenda.titulo.toLowerCase() === titulo.toLowerCase());

    if (AgendasIndex === -1) {
        return res.send(`<h1>Agenda não encontrada.</h1><button><a href="/">Voltar</a></button>`);
    }

    Agendas[AgendasIndex].descricao = NovaDescricao;
    Agendas[AgendasIndex].disciplina = NovaDisciplina;
    Agendas[AgendasIndex].dataEntrega = NovaDataEntrega;

    SalvarDados(Agendas);
    res.send(`<h1>Dados da Agenda atualizados com sucesso!</h1><button><a href="/">Voltar</a></button>`);
});


app.get('/excluir-agendas', (req, res) => {
    res.sendFile(path.join(__dirname, 'ExcluirAgenda.html'));
});

app.get('/excluir-agendas-confirmado', (req, res) => {
    const titulo = req.query.titulo;

    const AgendasIndex = Agendas.findIndex(agenda => agenda.titulo.toLowerCase() === titulo.toLowerCase());

    if (AgendasIndex === -1) {
        return res.send(`<h1>Agenda não encontrada.</h1><a href="/">Voltar</a>`);
    }

    Agendas.splice(AgendasIndex, 1);
    SalvarDados(Agendas);
    res.send(`<h1>Agenda "${titulo}" excluída com sucesso!</h1><a href="/">Voltar</a>`);
});


app.listen(port, () => {
    console.log(`Servidor Iniciando em http://localhost:${port}`);
});
