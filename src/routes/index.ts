import { Router } from "express";
//import mysql, { MysqlError } from 'mysql';

const mysql = require('mysql')

var estoque:string = "fortaleza_estoque";
var vendas:string ="fortaleza_vendas";
var publico:string = "fortaleza_publico";


var con = mysql.createPool({
  connectionLimit : 10,
    host: "192.168.100.106",
    user: "root",
    password: "Nileduz",
    database: estoque,
    database2: publico,
    database3: vendas,
})



var estoque2:string = "wp_estoque";
var vendas2:string ="wp_vendas";
var publico2:string = "wp_publico";

var con2 = mysql.createPool({
  connectionLimit : 10,
    host: "192.168.100.106",
    user: "root",
    password: "Nileduz",
    database: estoque2,
    database2: publico2,
    database3: vendas2,
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

/* 
interface Cliente {
  CODIGO: string;
  NOME: string;
  CPF: string;
  RG: string;
  VEICULOS: Array<{ CODIGO: string; PLACA: string; ANO: string }>;
}

router.get('/clientes', (req: Request, res: Response) => {
  con.query(
    `
    SELECT 
      clie.codigo, clie.cpf, clie.rg,  clie.nome, 
      IFNULL(vei.CODIGO, '0') AS VEICULO_CODIGO, IFNULL(vei.placa, '0') AS placa, 
      IFNULL(vei.ano, '0000-00-00') AS ano
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
            existingCliente.VEICULOS.push({ CODIGO: row.VEICULO_CODIGO, PLACA: row.placa, ANO: row.ano });
          } else {
            clientesArray.push({
              CODIGO: row.codigo,
              NOME: row.nome,
              CPF: row.cpf,
              RG: row.rg,
              VEICULOS: [{ CODIGO: row.VEICULO_CODIGO, PLACA: row.placa, ANO: row.ano }],
            });
          }
        });

        res.json(clientesArray);
      }
    }
  );
});
 */
router.get('/clientes2', (req: Request, res: Response) => {
  con.query(`SELECT codigo,cpf,rg,nome FROM ${publico}.cad_clie;`,(err: string, response:any)=>{
    if(err) throw err;
    res.json(response)

  })
});
 

  //var resposta:any; 
  //var resposta2:any; 
  var saldo:any;
  var outrocodigo:any;

router.get('/estoque', async (req, res) => {
        try {
          var resposta1:any = await executarConsulta(con, publico, estoque);
          var resposta2:any = await executarConsulta(con2, publico2, estoque2);
       
          const produtosComSaldos: any[] = [];

          resposta1.forEach((produto1: any) => {
            resposta2.forEach((produto2: any) => {
             
              if (produto1.outro_cod === produto2.outro_cod) {
                const saldo = produto1.estoque + produto2.estoque;
      
                const produtoComSaldo = {
                  codigo: produto1.codigo,
                  outro_cod: produto1.outro_cod,
                  estoque: saldo,
                };
      
              //  produtosComSaldos.push(produtoComSaldo);

              }
              res.json({saldo})
            });

          });
      
          // Envie o objeto de saldos como resposta JSON
          res.json(produtosComSaldos);
       
        } catch (error) {
          res.status(500).json({ error: 'Erro na consulta ao banco de dados' });
        }
     



          function comparar(resposta1:any, resposta2:any){

            for(let i=0;i <= resposta1.length;i++){


                const prod1 = resposta1[i];
                    const prod2 = resposta2[i];
                
                  if(resposta1[i].outro_cod === resposta2[i].outrocod ){
                    const saldo = resposta1[2].estoque  + resposta2[2].estoque;
                    res.json({saldo})
                  }else{
                    return;
                  }
            }

          
          if(resposta1[2].outro_cod === resposta2[2].outro_cod){
            saldo = resposta1[1].estoque + resposta2[2].estoque;
            outrocodigo = resposta1[2].outro_cod;
          }else{
            res.send("erro!")
          }
            
          return res.json({saldo,outrocodigo});
      }
      //comparar(resposta1,resposta2);
    } );

        function executarConsulta(conexao:any, publico:string, estoque:string) {
              return new Promise((resolve, reject) => {
                conexao.query(`
                    SELECT cp.codigo, cp.outro_cod, ps.estoque
                    FROM ${publico}.cad_prod cp 
                    JOIN ${publico}.prod_tabprecos tp ON tp.PRODUTO = cp.CODIGO 
                    JOIN ${estoque}.prod_setor ps ON ps.produto = cp.codigo;
                  `, (err:any, response:any) => {
                  if (err) {
                    reject(err);
                } else {
                  resolve(response);
                }
            });
          });
        }

        function updateProd( estoque:any,saldo:any,sku:any){
          let sql =`
            UPDATE ${estoque}.prod_saldo
            SET ESTOQUE=${saldo}
            WHERE SKU= ${sku};
            ;
          `
          con.query(sql,(err:string, response:any)=>{
            console.log('produto atualizado')
          })
        }
       
  
  
  
   /*con2.query(` select cp.codigo,cp.outro_cod, ps.estoque
              from  ${publico}.cad_prod cp 
            join ${publico}.prod_tabprecos tp 
            on tp.PRODUTO = cp.CODIGO join ${estoque}.prod_setor ps on ps.produto = cp.codigo 
            ;`
           , (err: string, response: any) => {
   if (err) throw err;
      resposta2 = response;
      // res.json(resposta2[0])
       })

     
    }*/
  
  
    /*while(resposta1 !=undefined || resposta1 !=null){
              for(let i=0;i <= resposta1.length || resposta2.length;i++){
                 const prod1 = resposta1[i];
                  const prod2 = resposta2[i];
                
                  if(resposta1[2].outro_cod === resposta2[2].outrocod ){
                    const saldo = resposta1[2].estoque  + resposta2[2].estoque;
                    res.json({saldo})
                  }else{
                    return;
                  }
            } 
          }*/
  
  
  
  
  
  
  
  /*___________________estoque_real_____________________________________________________________________________________*/
  
  /*
SELECT  est.CODIGO,est.SKU ,IF(est.estoque < 0, 0, est.estoque) AS ESTOQUE
FROM 
        (SELECT
						P.CODIGO, p.OUTRO_COD SKU,
						(SUM(PS.ESTOQUE) - 
					(SELECT COALESCE(SUM((IF(PO.QTDE_SEPARADA > (PO.QUANTIDADE - PO.QTDE_MOV), PO.QTDE_SEPARADA, (PO.QUANTIDADE - PO.QTDE_MOV)) * PO.FATOR_QTDE) * IF(CO.TIPO = '5', -1, 1)), 0)
								FROM space_eletro_vendas.cad_orca AS CO
								LEFT OUTER JOIN space_eletro_vendas.pro_orca AS PO ON PO.ORCAMENTO = CO.CODIGO
								WHERE CO.SITUACAO IN ('AI', 'AP', 'FP')
								AND PO.PRODUTO = P.CODIGO)) AS estoque
					FROM space_eletro_estoque.prod_setor AS PS
					LEFT JOIN space_eletro_publico.cad_prod AS P ON P.CODIGO = PS.PRODUTO
					INNER JOIN space_eletro_publico.cad_pgru AS G ON P.GRUPO = G.CODIGO
					LEFT JOIN space_eletro_estoque.setores AS S ON PS.SETOR = S.CODIGO
					WHERE S.EST_ATUAL = 'X' AND  P.OUTRO_COD in(Select OUTRO_COD from space_eletro_publico.cad_prod Where CODIGO = '1353')
					GROUP BY P.CODIGO) AS est;





SELECT  est.CODIGO,  IF(est.estoque < 0, 0, est.estoque) AS ESTOQUE
FROM 
        (SELECT
						P.CODIGO, 
						(SUM(PS.ESTOQUE) - 
						(SELECT COALESCE(SUM((IF(PO.QTDE_SEPARADA > (PO.QUANTIDADE - PO.QTDE_MOV), PO.QTDE_SEPARADA, (PO.QUANTIDADE - PO.QTDE_MOV)) * PO.FATOR_QTDE) * IF(CO.TIPO = '5', -1, 1)), 0)
								FROM space_eletro_vendas.cad_orca AS CO
								LEFT OUTER JOIN space_eletro_vendas.pro_orca AS PO ON PO.ORCAMENTO = CO.CODIGO
								WHERE CO.SITUACAO IN ('AI', 'AP', 'FP')
								AND PO.PRODUTO = P.CODIGO)) AS estoque
					FROM space_eletro_estoque.prod_setor AS PS
					LEFT JOIN space_eletro_publico.cad_prod AS P ON P.CODIGO = PS.PRODUTO
					INNER JOIN space_eletro_publico.cad_pgru AS G ON P.GRUPO = G.CODIGO
					LEFT JOIN space_eletro_estoque.setores AS S ON PS.SETOR = S.CODIGO
					WHERE S.EST_ATUAL = 'X' AND P.OUTRO_COD = '20.03.20505'
					GROUP BY  p.outro_cod) AS est;
          */