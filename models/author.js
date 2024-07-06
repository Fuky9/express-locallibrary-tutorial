const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  firstName: { type: String, required: true, maxLength: 100 },
  familyName: { type: String, required: true, maxLength: 100 },
  dateOfBirth: { type: Date },
  dateOfDeath: { type: Date },
});

// Arrow functions are not used there because of need of using this
// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  let fullname = "";
  if (this.firstName && this.familyName) {
    fullname = `${this.firstName} ${this.familyName}`;
  }
  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  return `/catalog/author/${this._id}`;
});

module.exports = mongoose.model("Author", AuthorSchema);
