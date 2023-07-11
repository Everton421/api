import { Router } from "express";

const mysql = require('mysql')

var con = mysql.createConnection({
    host: "177.125.218.237",
    user: "intersig",
    password: "Ganapataye",

    database: "clsegteste_estoque",
    database2: "clsegteste_publico",
    database3: "clsegteste_vendas",


})

export const router = Router()

router.all('/teste', (req, res) => {


})



router.all('/', (req, res) => {
    const client: number = req.body.cliente.codigo;
    const reqProd = req.body.produtos;
    var reqPar: any = req.body.parcelas;
    var total_produtos: any = req.body.dadosorcamento.TOTAL_PRODUTOS;
    var desc_prod = req.body.dadosorcamento.DESC_PROD;
    var total = req.body.dadosorcamento.TOTAL;
    var vendedor: any = 1;

    function obterDataAtual() {
        const dataAtual = new Date();
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const ano = dataAtual.getFullYear();
        return `${ano}-${mes}-${dia}`;
    }

    const dataAtual = obterDataAtual();

    const codsite = 10;
    if (req.body == undefined) {
        return console.log("valores inválidos");
    } else {
        con.query(
            `INSERT INTO clsegteste_vendas.cad_orca ` +
            `(cliente, total_produtos, DESC_PROD, TOTAL_GERAL, DATA_CADASTRO, SITUACAO,VENDEDOR,CONTATO , DATA_INICIO,DATA_PEDIDO, DATA_APROV, QTDE_PARCELAS)  
            VALUES (?, ?, ?, ?, ?, ?, ? , ? , ? ,?, ?,?)`,
            [client, total_produtos, desc_prod, total, dataAtual, 'EA',vendedor,'REACT', dataAtual, dataAtual,dataAtual,1],
            (err: string, result: any) => {
                if (err) throw err;
                const codOrca = result.insertId;
                var produto: any = reqProd;
                for (let i = 0; i <= reqProd.length; i++) {
                    if (produto[i] == undefined) {
                        produto[i] = 1;
                        break;
                    }
                    let j = i + 1;
                    con.query(
                        `INSERT INTO clsegteste_vendas.pro_orca (orcamento, sequencia, produto, unitario, quantidade, preco_tabela,tabela, total_liq, unit_orig) ` +
                        `VALUES (?, ?, ?, ? , ?, ?, ?, ?, ?)`,
                        [codOrca, j, produto[i].prod, produto[i].preco, produto[i].qtd, produto[i].preco,1,produto[i].totalProduto, produto[i].preco ],
                        (err: string, response: any) => {
                            if (err) throw err;
                        }
                    );
                }

                con.query(
                    `INSERT INTO clsegteste_vendas.par_orca(orcamento, parcela, valor, vencimento, tipo_receb )`+
                    `VALUES (?,?,?,?,?)`,
                    [codOrca, 1,total,dataAtual,1 ],
                    (err: string, response:any)=>{
                        if (err) throw err;
                    }
                )

            }
        );
        console.log("orçamento gravado");
        console.log(dataAtual);
    }
});



router.get('/produtos', (req, res) => {
    con.query('select cp.codigo,cp.descricao,tp.PRECO from clsegteste_publico.cad_prod cp join clsegteste_publico.prod_tabprecos tp on tp.PRODUTO = cp.CODIGO where tp.TABELA = 1;', (err: string, response: any) => {
        if (err) throw err;
        res.json(response)
    })

    router.get('/clientes', (req, res) => {
        con.query('select codigo,nome ,cpf,cep, cidade,bairro, rg,celular,telefone_com from clsegteste_publico.cad_clie;', (err: string, response: any) => {
            if (err) throw err;
            res.json(response)
        })
    })



   

})

router.get('/orcamentos', (req, res) => {
    con.query(`SELECT cdor.CODIGO, cdcl.NOME, cdor.DATA_CADASTRO, cdor.TOTAL_GERAL FROM clsegteste_vendas.cad_orca cdor join clsegteste_publico.cad_clie cdcl on cdor.cliente = cdcl.codigo where cdor.CONTATO = 'REACT';`, (err: string, response: any) => {
        if (err) throw err;
        res.json(response)
    })
})
