import { Router } from "express";
//import mysql, { MysqlError } from 'mysql';

const mysql = require('mysql')

var estoque = "clsegteste_estoque";
var vendas ="clsegteste_vendas";
var publico = "clsegteste_publico";

var con = mysql.createPool({
  connectionLimit : 10,
    host: "177.125.218.237",
    user: "intersig",
    password: "Ganapataye",
    database: estoque,
    database2: publico,
    database3: vendas,
})

export const router = Router()

router.all('/teste', (req, res) => {
console.log(req.body)

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
            `INSERT INTO ${vendas}.cad_orca ` +
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
                        `INSERT INTO ${vendas}.pro_orca (orcamento, sequencia, produto, unitario, quantidade, preco_tabela,tabela, total_liq, unit_orig) ` +
                        `VALUES (?, ?, ?, ? , ?, ?, ?, ?, ?)`,
                        [codOrca, j, produto[i].prod, produto[i].preco, produto[i].qtd, produto[i].preco,1,produto[i].totalProduto, produto[i].preco ],
                        (err: string, response: any) => {
                            if (err) throw err;
                        }
                    );
                }

                con.query(
                    `INSERT INTO ${vendas}.par_orca(orcamento, parcela, valor, vencimento, tipo_receb )`+
                    `VALUES (?,?,?,?,?)`,
                    [codOrca, 1,total,dataAtual,1 ],
                    (err: string, response:any)=>{
                        if (err) throw err;
                    }
                )

            }
        );
        console.log("orçamento gravado"+dataAtual);

    }

});



router.get('/produtos', (req, res) => {
    con.query(`select cp.codigo,cp.descricao,tp.PRECO from ${publico}.cad_prod cp join ${publico}.prod_tabprecos tp on tp.PRODUTO = cp.CODIGO where tp.TABELA = 1;`, (err: string, response: any) => {
        if (err) throw err;
        res.json(response)
    })

})



router.get('/servicos', (req, res) => {
  con.query(`SELECT CODIGO, APLICACAO,VALOR from ${publico}.cad_serv;`, (err: string, response: any) => {
      if (err) throw err;
      res.json(response)
  })
})


router.get('/vendedor', (req, res) => {
  con.query(`SELECT CODIGO, APELIDO from ${publico}.cad_vend;`, (err: string, response: any) => {
      if (err) throw err;
      res.json(response)
  })
})
router.get('/veiculos', (req, res) => {
  con.query(`select codigo, cliente, placa,modelo, ano from ${publico}.cad_veic;`, (err: string, response: any) => {
      if (err) throw err;
      res.json(response)
  })
})





//SELECT CODIGO, descricao from tipos_os;



  

import { Request, Response } from 'express';

interface Orcamento {
  CODIGO: string;
  NOME: string;
  DATA_CADASTRO: string;
  TOTAL_GERAL: number;
  produtos: string[];
}

router.get('/orcamentos', (req: Request, res: Response) => {
  con.query(
    `SELECT
    cdor.CODIGO,
    cdcl.NOME,
    DATE_FORMAT(cdor.DATA_CADASTRO,'%d-%m-%Y') DATA_CADASTRO,
    cdor.TOTAL_GERAL,
    pro.PRODUTO,
    cprod.descricao,
    pro.quantidade,
    pro.unitario,
    pro.desconto,
    pro.total_liq
    FROM ${vendas}.cad_orca cdor
  JOIN ${publico}.cad_clie cdcl ON cdor.cliente = cdcl.codigo
  LEFT JOIN ${vendas}.pro_orca pro ON cdor.CODIGO = pro.ORCAMENTO
   join  ${publico}.cad_prod cprod on cprod.codigo = pro.produto
  WHERE cdor.CONTATO = 'REACT';`,
    (err:string, response:any) => {
      if (err) throw err;

      const orcamentos: Orcamento[] = [];
      let orcamentoAtual: string | null = null;

      response.forEach((row: any) => {
        // Verifica se é um novo orçamento
        if (row.CODIGO !== orcamentoAtual) {
          // Cria um novo objeto de orçamento
          orcamentoAtual = row.CODIGO;
          orcamentos.push({
            CODIGO: row.CODIGO,
            NOME: row.NOME,
            DATA_CADASTRO: row.DATA_CADASTRO,
            TOTAL_GERAL: row.TOTAL_GERAL,
            produtos: [],
          });
        }

        // Adiciona o produto ao orçamento atual
        if (row.PRODUTO) {
          const produto:any = {
            codigo: row.PRODUTO,
            descricao: row.descricao, // Inclui a descrição do produto
            quantidade:row.quantidade,
            unitario: row.unitario,
            total: row.total_liq,
            desconto: row.desconto

          };
          orcamentos[orcamentos.length - 1].produtos.push(produto);
        }
      });

      res.json(orcamentos);
      
    }
  );
});


interface Cliente {
  CODIGO: string;
  NOME: string;
  CPF: string;
  RG: string;

  VEICULOS: Array<{ PLACA: string; ANO: string }>;
}
router.get('/clientes', (req: Request, res: Response) => {
  con.query(
    `
    SELECT 
      clie.codigo, clie.cpf, clie.rg,  clie.nome, IFNULL(vei.placa, '0') AS placa, IFNULL(vei.ano, '0000-00-00') AS ano
    FROM ${publico}.cad_clie clie
    LEFT JOIN ${publico}.cad_veic vei ON vei.cliente = clie.codigo;
  `,
    (err: string, response: any[]) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao buscar dados no banco de dados' });
      } else {
        const clientesArray: Cliente[] = [];

        response.forEach((row) => {
          const existingCliente = clientesArray.find(
            (cliente) => cliente.CODIGO === row.codigo
          );

          if (existingCliente) {
            existingCliente.VEICULOS.push({ PLACA: row.placa, ANO: row.ano });
          } else {
            clientesArray.push({
              CODIGO: row.codigo,
              NOME: row.nome,
              CPF: row.cpf,
              RG: row.rg,
              VEICULOS: [{ PLACA: row.placa, ANO: row.ano }],
            });
          }
        });

        res.json(clientesArray);
      }
    }
  );
});


