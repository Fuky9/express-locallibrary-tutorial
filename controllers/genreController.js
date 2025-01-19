const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genre
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 });

  res.render("genreList", { title: "Genre list", genreList: allGenres });
});

// Display detail page for a specific Genre
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }, "title summary"),
  ]);

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genreDetail", {
    title: "Genre Detail",
    genre: genre,
    genreBooks: booksInGenre,
  });
});

// Display Genre create form on GET
exports.genre_create_get = (req, res, next) => {
  res.render("genreForm", {
    title: "Create Genre",
  });
};

// Handle Genre create on POST
exports.genre_create_post = [
  // Validate and sanitize the name field
  body("name", "Genre must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      //There are errors. Render the form again with sanitized values/error messages
      res.render("genreForm", {
        title: "Create Genre",
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Check if Genre with same name already exists
      const genreExists = await Genre.findOne({
        name: req.body.name,
      }).collation({ locale: "en", strength: 2 });
      if (genreExists) {
        // Genre exists, redirect to its detail page
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved, redirect to genre detail page
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }, "title summary"),
  ]);

  if (!genre) {
    res.redirect("/catalog/genres");
    return;
  }

  res.render("genreDelete", {
    title: "Delete Genre",
    genre: genre,
    genreBooks: genreBooks,
  });
});

// Handle Genre delete on POST
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, genreBooks] = await Promise.all([
    Genre.findById(req.params.id),
    Book.find({ genre: req.params.id }, "title summary"),
  ]);

  if (genreBooks.length > 0) {
    res.render("genreDelete", {
      title: "Delete Genre",
      genre: genre,
      genreBooks: genreBooks,
    });
    return;
  } else {
    await Genre.findByIdAndDelete(req.body.id);
    res.redirect("/catalog/genres");
  }
});

// Display Genre update form on GET
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
