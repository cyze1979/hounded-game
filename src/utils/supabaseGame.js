import { supabase } from '../lib/supabase';
import { Dog } from '../models/Dog';
import { Player } from '../models/Player';

export const createGameSession = async (sessionKey) => {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert({ session_key: sessionKey })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const loadGameSession = async (sessionKey) => {
  const { data: sessionData, error: sessionError } = await supabase
    .from('game_sessions')
    .select()
    .eq('session_key', sessionKey)
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (!sessionData) return null;

  const { data: playersData, error: playersError } = await supabase
    .from('players')
    .select()
    .eq('session_id', sessionData.id)
    .order('player_index');

  if (playersError) throw playersError;

  const players = [];
  for (const playerData of playersData) {
    const player = Player.fromJSON({
      name: playerData.name,
      color: playerData.color,
      index: playerData.player_index,
      money: playerData.money,
      bets: playerData.bets,
      totalWinnings: playerData.total_winnings,
      totalRaces: playerData.total_races,
      totalWins: playerData.total_wins
    });

    const { data: dogsData, error: dogsError } = await supabase
      .from('dogs')
      .select()
      .eq('session_id', sessionData.id)
      .eq('owner_player_id', playerData.id);

    if (dogsError) throw dogsError;

    player.dogs = dogsData.map(dData => Dog.fromJSON({
      id: dData.id,
      name: dData.name,
      breed: dData.breed,
      ageInMonths: dData.age_in_months,
      gender: dData.gender,
      speed: dData.speed,
      stamina: dData.stamina,
      acceleration: dData.acceleration,
      focus: dData.focus,
      fitness: dData.fitness,
      races: dData.races,
      wins: dData.wins,
      experience: dData.experience,
      cupWins: dData.cup_wins,
      trackRecords: dData.track_records,
      lastTrainedMonth: dData.last_trained_month,
      purchasePrice: dData.purchase_price,
      totalEarnings: dData.total_earnings,
      specialTrait: dData.special_trait,
      owner: dData.owner,
      imageNumber: dData.image_number
    }));
    players.push(player);
  }

  const { data: racesData, error: racesError } = await supabase
    .from('races')
    .select()
    .eq('session_id', sessionData.id)
    .order('created_at', { ascending: false });

  if (racesError) throw racesError;

  const { data: marketDogsData } = await supabase
    .from('market_dogs')
    .select()
    .eq('session_id', sessionData.id)
    .order('slot');

  const marketDogs = marketDogsData
    ? marketDogsData.map(md => Dog.fromJSON(md.dog_data))
    : [];

  return {
    sessionId: sessionData.id,
    sessionKey,
    players,
    raceHistory: racesData || [],
    marketDogs,
    currentMonth: sessionData.current_month || 1,
    currentYear: sessionData.current_year || 2048,
    createdAt: sessionData.created_at
  };
};

export const saveGameSession = async (sessionId, gameState) => {
  if (!sessionId) throw new Error('Session ID required');

  await supabase
    .from('game_sessions')
    .update({
      current_month: gameState.currentMonth || 1,
      current_year: gameState.currentYear || 2048,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  const { data: existingPlayersData } = await supabase
    .from('players')
    .select('id, player_index')
    .eq('session_id', sessionId);

  for (const player of gameState.players) {
    const playerData = {
      session_id: sessionId,
      player_index: player.index,
      name: player.name,
      color: player.color,
      money: player.money,
      bets: player.bets || [],
      total_winnings: player.totalWinnings || 0,
      total_races: player.totalRaces || 0,
      total_wins: player.totalWins || 0
    };

    const existingPlayer = existingPlayersData?.find(
      p => p.player_index === player.index
    );

    let playerId;
    if (existingPlayer) {
      const { data, error } = await supabase
        .from('players')
        .update(playerData)
        .eq('id', existingPlayer.id)
        .select()
        .single();
      if (error) throw error;
      playerId = data.id;
    } else {
      const { data, error } = await supabase
        .from('players')
        .insert(playerData)
        .select()
        .single();
      if (error) throw error;
      playerId = data.id;
    }

    for (const dog of player.dogs) {
      const dogData = {
        session_id: sessionId,
        owner_player_id: playerId,
        name: dog.name,
        breed: dog.breed,
        age_in_months: dog.ageInMonths,
        gender: dog.gender,
        speed: dog.speed,
        stamina: dog.stamina,
        acceleration: dog.acceleration,
        focus: dog.focus,
        fitness: dog.fitness,
        races: dog.races,
        wins: dog.wins,
        experience: dog.experience,
        cup_wins: dog.cupWins || 0,
        track_records: dog.trackRecords || [],
        last_trained_month: dog.lastTrainedMonth,
        purchase_price: dog.purchasePrice,
        total_earnings: dog.totalEarnings || 0,
        special_trait: dog.specialTrait,
        owner: dog.owner,
        image_number: dog.imageNumber
      };

      const { data: existingDog } = await supabase
        .from('dogs')
        .select('id')
        .eq('session_id', sessionId)
        .eq('owner_player_id', playerId)
        .eq('name', dog.name)
        .maybeSingle();

      if (existingDog) {
        const { error } = await supabase
          .from('dogs')
          .update(dogData)
          .eq('id', existingDog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dogs')
          .insert(dogData);
        if (error) throw error;
      }
    }
  }

  if (gameState.marketDogs && gameState.marketDogs.length > 0) {
    await supabase
      .from('market_dogs')
      .delete()
      .eq('session_id', sessionId);

    for (let i = 0; i < gameState.marketDogs.length; i++) {
      const dog = gameState.marketDogs[i];
      await supabase
        .from('market_dogs')
        .insert({
          session_id: sessionId,
          dog_data: dog.toJSON(),
          slot: i
        });
    }
  }
};

export const saveRace = async (sessionId, gameDay, trackName, distance, winnerDogId, prizeMoney, participantIds) => {
  const { error } = await supabase
    .from('races')
    .insert({
      session_id: sessionId,
      game_day: gameDay,
      track_name: trackName,
      distance,
      winner_dog_id: winnerDogId,
      prize_pool: prizeMoney,
      participant_ids: participantIds
    });

  if (error) throw error;
};

export const saveTrackRecords = async (sessionId, tracks) => {
  if (!tracks) return;

  for (const [trackName, trackData] of Object.entries(tracks)) {
    const recordData = {
      session_id: sessionId,
      track_name: trackName,
      best_time: trackData.bestTime,
      best_time_holder: trackData.bestTimeHolder,
      races_held: trackData.racesHeld || 0,
      last_winner: trackData.lastWinner
    };

    const { error } = await supabase
      .from('track_records')
      .upsert(recordData, {
        onConflict: 'session_id,track_name'
      });

    if (error) console.error('Error saving track record:', error);
  }
};

export const loadTrackRecords = async (sessionId) => {
  const { data, error } = await supabase
    .from('track_records')
    .select()
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error loading track records:', error);
    return null;
  }

  const tracks = {};
  data.forEach(record => {
    tracks[record.track_name] = {
      bestTime: record.best_time,
      bestTimeHolder: record.best_time_holder,
      racesHeld: record.races_held,
      lastWinner: record.last_winner
    };
  });

  return tracks;
};

export const hasSave = async () => {
  const lastSessionKey = localStorage.getItem('hounded_last_session');
  if (!lastSessionKey) return false;

  try {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('session_key', lastSessionKey)
      .maybeSingle();

    return !error && data !== null;
  } catch (error) {
    console.error('hasSave error:', error);
    return false;
  }
};
