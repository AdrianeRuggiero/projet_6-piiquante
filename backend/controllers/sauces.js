const Sauce = require('../models/sauce');
const fs = require('fs');
const status = require('http-status');


//Creates Sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({ //creates a new object sauce using it's model
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  });
  console.log(sauce)
  sauce.save() //Saves the new sauce in the database
    .then(() => res.status(status.CREATED).json({ message: 'Nouvelle sauce sauvegardée !' }))
    .catch(error => {
      res.status(status.BAD_REQUEST).json({ error });
      console.log(error)
      fs.unlink(`images/${sauce.imageUrl.split('/images/')[1]}`, (err) => { console.log(err) })
    })
  console.log(sauce);
};

//Modifies Sauce
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? //Verifies if the modification it's a new image or a new body
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body };
  Sauce.updateOne({ _id: req.params.id }, {...sauceObject, _id: req.params.id })
    .then(() => res.status(status.OK).json({ message: 'Cette sauce a été modifiée' }))
    .catch(() => res.status(status.BAD_REQUEST).json({ error }))
};


//Deletes Sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }) //Finds sauce id
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1]; //gets the image
      fs.unlink(`images/${filename}`, () => { //deletes image from the filesystem
        Sauce.deleteOne({ _id: req.params.id }) //deletes the sauce from the database
          .then(() => res.status(status.OK).json({ message: 'Sauce supprimée' }))
          .catch(error => res.status(status.BAD_REQUEST).json({ error }))
      });
    })
};

//Gets all sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(status.OK).json(sauces))
    .catch(error => res.status(status.BAD_REQUEST).json({ error }))
};


//Gets one sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(status.OK).json(sauce))
    .catch(error => res.status(status.NOT_FOUND).json({ error }))
};

//Management of likes
exports.likeSauce = (req, res) => {
  let like = req.body.like
  let userId = req.body.userId
  let sauceId = req.params.id

  // Like
  if (like == 1) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (!sauce.usersLiked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
            .then(() => res.status(status.CREATED).json({ message: 'Votre Like a été ajoutée à cette sauce!' }))
            .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
        }
      })
      .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
  }

  // Dislike
  if (like === -1) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (!sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
            .then(() => res.status(status.CREATED).json({ message: 'Votre Dislike a été ajoutée à cette sauce!' }))
            .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
        }
      })
      .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
  }

  // Anulation Like ou Dislike
  if (like === 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        // if user likes the sauce
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, { $inc: { likes: -1 }, $pull: { usersLiked: userId } })
            .then(() => res.status(status.CREATED).json({ message: 'Votre avez enlevée votre Like' }))
            .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
        }

        // if user dislikes the sauce
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: userId } })
            .then(() => res.status(status.CREATED).json({ message: 'Votre avez enlevée votre Dislike' }))
            .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
        }
      })
      .catch((error) => res.status(status.BAD_REQUEST).json({ error }));
  }
};