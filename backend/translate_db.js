const mongoose = require('mongoose');
const BachatGat = require('./models/BachatGat');
require('dotenv').config();

const translateBachatGats = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    const gats = await BachatGat.find();
    console.log(`Found ${gats.length} gats to translate.`);

    for (let gat of gats) {
      if (gat.name === 'Sushir Jyot') {
        gat.name = 'सुशीर ज्योत (Sushir Jyot)';
        gat.location.village = 'गाव अ (Village A)';
        gat.location.district = 'जिल्हा अ (District A)';
      } else if (gat.name === 'Sushir Umang') {
        gat.name = 'सुशीर उमंग (Sushir Umang)';
        gat.location.village = 'गाव ब (Village B)';
        gat.location.district = 'जिल्हा ब (District B)';
      } else if (gat.name === 'Sushir Udan') {
        gat.name = 'सुशीर उडान (Sushir Udan)';
        gat.location.village = 'गाव क (Village C)';
        gat.location.district = 'जिल्हा क (District C)';
      }
      await gat.save();
    }
    console.log('Successfully updated Bachat Gats to use translated names.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

translateBachatGats();
