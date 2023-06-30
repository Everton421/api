import { Router } from "express";

const mysql = require('mysql')

var con = mysql.createConnection({
    host: "192.168.100.106",
    user: "root",
    password: "Nileduz",

    database: "clseg_estoque",
    database2: "clseg_publico",
    database3: "clseg_vendas",


})

export const router = Router()

router.all('/teste', (req, res) => {
    console.log(req.body)



})



router.all('/', (req, res) => {
    const client:number = req.body.cliente.codigo;

    const reqProd = req.body.produtos;
    var reqPar: any = req.body.parcelas;
    var total_produtos:any = req.body.dadosorcamento.TOTAL_PRODUTOS;
    var desc_prod = req.body.dadosorcamento.DESC_PROD;
    var total = req.body.dadosorcamento.TOTAL;
    var data_cadastro:any = req.body.dadosorcamento.DATA_CADASTRO;
    var vendedor:any = req.body.dadosorcamento.VENDEDOR;

    const codsite = 10;
    if (client == undefined) {
        return console.log("valores invalidos");
    } else {

        con.query(`INSERT INTO clseg_vendas.cad_orca (cod_site,cliente,total_produtos,DESC_PROD,TOTAL_GERAL,DATA_CADASTRO,VENDEDOR)  
        VALUES(${codsite},${client},${total_produtos},${desc_prod}, ${total},${data_cadastro},${vendedor})`,
        
        (err: string, result: any) => {
            if (err) throw err;
            const codOrca = result.insertId;
            // console.log(`orçamento num: ${codOrca}`)
            var produto: any = reqProd
            for (let i = 0; i <= reqProd.length; i++) {
                if (produto[i] == undefined) {
                    produto[i] = 1
                    break;
                }

                let j = i + 1;

                con.query(`INSERT INTO clseg_vendas.pro_orca (orcamento, sequencia, produto) values(${codOrca},${j}, ${produto[i].prod})`, (err: string, response: any) => {
                    if (err) throw err;
                })
            }



        })
        console.log("orcamento gravado")
    }
});


router.get('/produtos', (req, res) => {
    con.query('select cp.codigo,cp.descricao,tp.PRECO from clseg_publico.cad_prod cp join clseg_publico.prod_tabprecos tp on tp.PRODUTO = cp.CODIGO where tp.TABELA = 1 LIMIT 100;', (err: string, response: any) => {
        if (err) throw err;
        res.json(response)
    })

    router.get('/clientes', (req, res) => {
        con.query('select codigo,nome ,cpf,cep, cidade,bairro, rg,celular,telefone_com from clseg_publico.cad_clie;', (err: string, response: any) => {
            if (err) throw err;
            res.json(response)
        })
    })




})
