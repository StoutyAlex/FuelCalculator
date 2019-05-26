const axios = require('axios');
const { get } = require('lodash');

const URL = `https://uk1.ukvehicledata.co.uk/api/datapackage/FuelPriceData?v=2&api_nullitems=1&auth_apikey=${process.env.VDUK_API_KEY}&user_tag=&key_postcode=m501az`;

const _getFuelPriceList = station => station.FuelPriceList.filter(fuelType => (
    fuelType.FuelType === 'Unleaded' || fuelType.FuelType === "Diesel")
  ).map(fuelType => { 
    return {
      type: fuelType.FuelType,
      price: fuelType.LatestRecordedPrice.InPence,
    };
  });

const _averagePrice = (station, type) => {
  const stationsWithUnleaded = [];

  station.filter(fuel => {
    const unleadedPrices = fuel.filter(fuelType => fuelType.type === type)[0];
    return unleadedPrices ? stationsWithUnleaded.push(unleadedPrices) : false;
  });
  const result = stationsWithUnleaded.reduce((acc, obj) => (obj ? acc + obj.price : acc), 0);
  return result / stationsWithUnleaded.length;
}

module.exports = async () => {
  const rawData = await axios.get(URL);
  const stations = get(rawData, 'data.Response.DataItems.FuelStationDetails.FuelStationList', []);

  const filteredStations = stations.map(_getFuelPriceList);

  const averagePriceUnleaded = _averagePrice(filteredStations, 'Unleaded').toFixed(1);
  const averagePriceDiesel = _averagePrice(filteredStations, 'Diesel').toFixed(1);

  return {
    unleaded: {
      inPence: averagePriceUnleaded * 10,
      inPounds: averagePriceUnleaded,
    },
    diesel: {
      inPence: averagePriceDiesel * 10,
      inPounds: averagePriceDiesel,
    },
  };
};