const bcrypt = require("bcryptjs");

const plainPassword = "Ayomide20$08";

bcrypt.hash(plainPassword, 10).then(hash => {
  console.log("Generated Hash:", hash);

  // Now try to compare
  bcrypt.compare(plainPassword, hash).then(result => {
    console.log("Match:", result); // ✅ should be true
  });
});
