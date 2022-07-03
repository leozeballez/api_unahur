var express = require("express");
var router = express.Router();
var models = require("../models");

router.get("/", (req, res) => {
  models.materias.findAll({ //nombre en plural
    attributes: ["id","nombre","id_aula"],
    include:[{as:'Aula-Relacionada', model:models.aula, attributes: ["id","nombre"]}]
  }).then(materias => res.send(materias)).catch(error => { return next(error)});
});

//get con paginacion - tuve que asignarle una ruta distinta para que no pise el get anterior
router.get("/paginadas/", (req, res) => {
  let pagina = req.query.pagina === undefined? 0 : +req.query.pagina; //esto se hizo así porque devuelve un string en vez de un entero
  let cantidad = req.query.cantidad === undefined? 0 : +req.query.cantidad;

  models.materias.findAll({ //nombre en plural
    attributes: ["id","nombre","id_aula"],
    include:[{as:'Aula-Relacionada', model:models.aula, attributes: ["id","nombre"]}],
    offset: pagina * cantidad, limit: cantidad
  }).then(materias => res.send(materias)).catch(error => { return next(error)});
});

router.post("/", (req, res) => {
  models.materias //nombre en plural
    .create({ nombre: req.body.nombre, id_aula: req.body.id_aula }) //se agrega el id_aula
    .then(materia => res.status(201).send({ id: materia.id, id_aula: req.body.id_aula })) //se agrega el id_aula acá tambien para que le asigne el id_aula que se le pasa
    .catch(error => {
      if (error == "SequelizeUniqueConstraintError: Validation error") {
        res.status(400).send('Bad request: existe otra materia con el mismo nombre')
      }
      else {
        console.log(`Error al intentar insertar en la base de datos: ${error}`)
        res.sendStatus(500)
      }
    });
});

const findMateria = (id, { onSuccess, onNotFound, onError }) => {
  models.materias //nombre en plural
    .findOne({
      attributes: ["id", "nombre", "id_aula"], //se agrega el 'id_aula'
      where: { id }
    })
    .then(materia => (materia ? onSuccess(materia) : onNotFound()))
    .catch(() => onError());
};

router.get("/:id", (req, res) => {
  findMateria(req.params.id, {
    onSuccess: materia => res.send(materia),
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.put("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .update({ nombre: req.body.nombre, id_aula: req.body.id_aula }, { fields: ["nombre", "id_aula"] })
      .then(() => res.sendStatus(200))
      .catch(error => {
        if (error == "SequelizeUniqueConstraintError: Validation error") {
          res.status(400).send('Bad request: existe otra materia con el mismo nombre')
        }
        else {
          console.log(`Error al intentar actualizar la base de datos: ${error}`)
          res.sendStatus(500)
        }
      });
    findMateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

router.delete("/:id", (req, res) => {
  const onSuccess = materia =>
    materia
      .destroy()
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500));
  findMateria(req.params.id, {
    onSuccess,
    onNotFound: () => res.sendStatus(404),
    onError: () => res.sendStatus(500)
  });
});

module.exports = router;
