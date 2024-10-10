const express = require('express');
const db = require('./db');
const app = express();
app.use(express.json());
const port = 3000;

let veiculos = [];

// novo veículo
app.post('/inserir', (req, res) => {
    const { marca, modelo, ano, cor, proprietario } = req.body;
    // memória volátil(apenas na memória) => veiculos.push({ id, marca, modelo, ano, cor, proprietario });
    db.query(
        `INSERT INTO veiculos (marca, modelo, ano, cor, proprietario) VALUES (?, ?, ?, ?, ?)`,
        [marca, modelo, Number(ano), cor, proprietario],
        function (err, results, fields) {
            if (err) {
                console.error('Erro na inserção:', err);
                return;
            }
            console.log(results);
            console.log(fields);
        }
    );
    res.send(`Veículo inserido!\n\nMarca: ${marca} \nModelo: ${modelo} \nAno: ${ano} \nCor: ${cor} \nProprietário: ${proprietario}`);
});

// selecionar todos os veículos
app.get('/veiculos', (req, res) => {
    db.query(
        `SELECT * FROM veiculos`,
        function (err, results, fields) {
            if (err) {
                console.error('Erro na consulta:', err);
                return res.status(500).json({ error: 'Erro ao consultar veículos' });
            }
            // Retorna os resultados como um objeto JSON
            return res.json(results);
        }
    );
});

// atualizar por ID
app.put('/atualizar/:id', (req, res) => {
    const { id } = req.params;
    const { marca, modelo, ano, cor, proprietario } = req.body;

    db.query(
        `UPDATE veiculos set marca = ?, modelo = ?, ano = ?, cor = ?, proprietario = ? WHERE id = ?`,
        [marca, modelo, Number(ano), cor, proprietario, id],
        function (err, results, fields) {
            if (err) {
                console.error('Erro na atualização:', err);
                return;
            }
            console.log(results);
            console.log(fields);
        }
    );
    res.send(`Veículo atualizado!\n${id}\nMarca: ${marca} \nModelo: ${modelo} \nAno: ${ano} \nCor: ${cor} \nProprietário: ${proprietario}`);


});

// deletar por ID
app.delete('/deletar/id/:id', (req, res) => {
    const { id } = req.params;
    const veiculoIndex = veiculos.findIndex(v => v.id == id);

    if (veiculoIndex !== -1) {
        veiculos.splice(veiculoIndex, 1); // para remover o splice e 1 só
        res.send('Veículo deletado com sucesso');
    } else {

        res.status(404).send('Veículo não encontrado');
    }
});

// deletar por modelo
app.delete('/deletar/modelo/:modelo', (req, res) => {
    const { modelo } = req.params;
    const veiculosAntes = veiculos.length; // lenght ver o tamnaho da array

    veiculos = veiculos.filter(v => v.modelo !== modelo);
    const veiculosDeletados = veiculosAntes - veiculos.length;

    if (veiculosDeletados > 0) {
        res.send(`${veiculosDeletados} veículo(s) deletado(s) com sucesso`);
    } else {
        res.status(404).send('Nenhum veículo encontrado com esse modelo');
    }
});

// selecionar por ID
app.get('/veiculos/:id', (req, res) => {
    const { id } = req.params;
    const veiculo = veiculos.find(v => v.id == id); // v recebe v.id igual ao id

    if (veiculo) {
        res.json(veiculo);
    } else {
        res.status(404).send('Veículo não encontrado');
    }
});

// selecionar por ano
app.get('/veiculos/ano/:ano', (req, res) => {
    const { ano } = req.params;
    const veiculosAno = veiculos.filter(v => v.ano == ano);

    if (veiculosAno.length > 0) {
        res.json(veiculosAno);
    } else {
        res.status(404).send('Nenhum veículo encontrado para o ano especificado');
    }
});

// selecionar todos os veículos da cor AZUL
app.get('/veiculos/cor/azul', (req, res) => {
    const veiculosAzuis = veiculos.filter(v => v.cor.toLowerCase() === 'azul'); // toLowerCase converte p letra minuscula

    if (veiculosAzuis.length > 0) {
        res.json(veiculosAzuis);
    } else {
        res.status(404).send('Nenhum veículo encontrado da cor azul');
    }
});

app.listen(port, () => {
    console.log(`Server listening on  http://localhost:${port}`);
});
app.delete('/deletar/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        `DELETE FROM veiculos WHERE id = ?`,
        [id],
        (err, results) => {
            if (err) {
                console.error('Erro ao deletar veículo:', err);
                return res.status(500).send('Erro ao deletar veículo');
            }
            res.send(`Veículo com ID ${id} deletado com sucesso!`);
        }
    );
});
app.get('/visualizar/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        `SELECT * FROM veiculos WHERE id = ?`,
        [id],
        (err, results) => {
            if (err) {
                console.error('Erro ao visualizar veículo:', err);
                return res.status(500).send('Erro ao visualizar veículo');
            }
            if (results.length === 0) {
                return res.status(404).send('Veículo não encontrado');
            }
            res.json(results[0]);
        }
    );
});
app.post('/enviar/:id', (req, res) => {
    const { id } = req.params;
    const { mensagem } = req.body;

    // Aqui você pode adicionar a lógica para enviar a mensagem, como salvar em um banco de dados ou enviar por um serviço.
    // Para fins de demonstração, vamos apenas simular um envio.

    console.log(`Mensagem enviada para o veículo com ID ${id}: ${mensagem}`);
    res.send(`Mensagem enviada para o veículo com ID ${id}: ${mensagem}`);
});
app.post('/enviar/:id', (req, res) => {
    const { id } = req.params;
    const { mensagem } = req.body;

    // Verifica se a mensagem não está vazia
    if (!mensagem) {
        return res.status(400).send('Mensagem não pode estar vazia');
    }

    // Insere a mensagem no banco de dados
    db.query(
        `INSERT INTO mensagens (veiculo_id, mensagem) VALUES (?, ?)`,
        [id, mensagem],
        (err, results) => {
            if (err) {
                console.error('Erro ao enviar mensagem:', err);
                return res.status(500).send('Erro ao enviar mensagem');
            }
            res.send(`Mensagem enviada para o veículo com ID ${id}: ${mensagem}`);
        }
    );
});
app.post('/enviar/:id', (req, res) => {
    const { id } = req.params;
    const { mensagem } = req.body;

    // Verifica se a mensagem não está vazia
    if (!mensagem) {
        return res.status(400).send('Mensagem não pode estar vazia');
    }

    // Simula o envio da mensagem
    console.log(`Mensagem enviada para o veículo com ID ${id}: ${mensagem}`);
    res.send(`Mensagem enviada para o veículo com ID ${id}: ${mensagem}`);
});
