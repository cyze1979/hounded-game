export const aiBuyDogs = (player, marketDogs, stableLimit) => {
  if (!player.isAi) return;

  const dogsToSell = player.dogs.filter(dog => {
    const category = dog.getAgeCategory();
    const rating = dog.getOverallRating();
    return category === 'elder' || (category === 'veteran' && rating < 60);
  });

  dogsToSell.forEach(dog => {
    const sellPrice = Math.floor(dog.getValue() * 0.7);
    player.money += sellPrice;
    player.dogs = player.dogs.filter(d => d.id !== dog.id);
  });

  while (player.dogs.length < stableLimit && marketDogs.length > 0) {
    const affordableDogs = marketDogs
      .filter(dog => {
        const price = dog.getValue();
        const category = dog.getAgeCategory();
        const rating = dog.getOverallRating();
        return player.money >= price &&
               (category === 'young' || category === 'prime') &&
               rating >= 55;
      })
      .sort((a, b) => b.getOverallRating() - a.getOverallRating());

    if (affordableDogs.length === 0) break;

    const dogToBuy = affordableDogs[0];
    const price = dogToBuy.getValue();

    if (player.money - price < 500) break;

    dogToBuy.purchasePrice = price;
    player.money -= price;
    player.dogs.push(dogToBuy);

    const index = marketDogs.findIndex(d => d.id === dogToBuy.id);
    if (index !== -1) {
      marketDogs.splice(index, 1);
    }
  }
};
