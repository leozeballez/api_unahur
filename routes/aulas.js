var express = require("express");
var router = express.Router();
var models = require("../models");
const jwtAuth = require("../jwtAuth"); //autenticacion de token
var jwt = require("jsonwebtoken"); //libreria de token

router.get("/", jwtAuth, (req, res) => { //el jwtAuth acá no permite consultar si no se envía el código token
  models.aula
    .findAll({
      attributes: ["id", "nombre"]
    })
    .then(aulas => {
      res.send(aulas)
    } )
    .catch(() => res.sendStatus(500));
});

router.get("/token/", (req, res) => { //este Get es solo para que devuelva el codigo token (ya que no se implementó una lista de usuarios válidos)
  models.aula
    .findAll({
      attributes: ["id", "nombre"]
    })
    .then(aulas => {
      //primer parametro, ingresamos informacion que queremos encriptar
      //segundo parametro, la llave (donde está el token)
      let token = jwt.sign({aulas}, process.env.JWT_KEY)
      res.json({token:token})//esto es para que devuelva el codigo que nos autorizará a consultar el primer get
    } )
    .catch(() => res.sendStatus(500));
});

router.get("/paginadas/", (req, res) => {
  let pagina = req.query.pagina === undefined? 0 : +req.query.pagina; //esto se hizo así porque devuelve un string en vez de un entero
  let cantidad = req.query.cantidad === undefined? 0 : +req.query.cantidad;

  models.aula
    .findAll({
      attributes: ["id", "nombre"],
      offset: pagina * cantidad, limit: cantidad
    })
    .then(aulas => res.send(aulas))
    .catch(() => res.sendStatus(500));
});

router.post("/", (req, res) => {
  models.aula
    .create({ nombre: req.body.nombre })
    .then(aula => res.status(201).send({ id: aula.id }))
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otro aula con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findAula = (id, { onSuccess, onNotFound, onError }) => {
  models.aula
    .findOne({
      attributes: ["id", "nombre"],
      where: { id }
    })
    .then(aula => (aula ? onSuccess(aula) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findAula(req.params.id, {
    onSuccess: aula => res.send(aula),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = aula =>
    aula
      .update({ nombre: req.body.nombre }, { fields: ["nombre"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otro aula con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findAula(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = aula =>
    aula
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findAula(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
