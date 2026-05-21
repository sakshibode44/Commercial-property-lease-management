const bcrypt = require('bcryptjs');
const hash = '$2b$12$ecZGbwakyM35DMHoas4/huCRUOrkjH0zS2ZvjMjV7xLvDaQFx2U7G';
const password = 'password';

bcrypt.compare(password, hash)
  .then((result) => {
    console.log('compare result:', result);
    process.exit(result ? 0 : 1);
  })
  .catch((error) => {
    console.error('error', error);
    process.exit(1);
  });
