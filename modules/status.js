const SCENE_CHANGE = 'scene_change';
const LAUNCH_SRV = 'launch_srv';
const RESET = 'reset';

module.exports.types = {
  SCENE_CHANGE,
  LAUNCH_SRV,
  RESET,
};

const sceneChange = (newScene) => ({
  type: SCENE_CHANGE,
  payload: newScene,
});

const launchSrv = (event) => ({
  type: LAUNCH_SRV,
  payload: event,
});

const reset = () => ({
  type: RESET,
});

module.exports.actions = {
  sceneChange,
  launchSrv,
  reset,
};

const defaultState = {
  previousStatus: undefined,
  generalStatus: 'Unknown Status',
  playerName: undefined,
  reputation: undefined,
  rank: undefined,
  faction: undefined,
  location: 'Nowhere',
  timestamp: new Date(),
};

const reducer = (state = defaultState, action) => {
  switch(action.type) {
    case SCENE_CHANGE: {
      const newState = sceneSwitch(action.payload.scene);
      return {
        ...state,
        previousStatus: state.generalStatus,
        generalStatus: newState || state.generalStatus,
        timestamp: newState ? action.payload.timestamp : state.timestamp,
      }
    }
    case LAUNCH_SRV:
      return {
        ...state,
        previousStatus: state.generalStatus,
        generalStatus: 'In an SRV',
        timestamp: action.payload.timestamp,
      }
    case RESET:
      return defaultState;
    default:
      return state;
  }
};

module.exports.reducer = reducer;

const sceneSwitch = (sceneType) => {
  switch (sceneType) {
    case 'MainMenu':
      return 'In Menus';
    case 'GalaxyMap':
      return 'In Galaxy Map';
    case 'SystemMap':
      return 'In System Map';
    case 'Supercruise':
      return 'Supercruise';
    case 'Starport':
      return 'Docked at a Starport';
    case 'Exploration':
    case 'DestinationFromSupercruise':
    case 'DestinationFromHyperspace':
      return 'In Normal Space';
    case 'Combat_Unknown':
    case 'CombatLargeDogFight':
    case 'Combat_Dogfight':
      return 'In Combat';
    case 'Combat_SRV':
      return 'In Combat - SRV';
    case 'DockingComputer':
      return 'Docking Using a Docking Computer';
    case 'GalacticPowers':
      return 'Viewing Galactic Powers';
    default:
      return;
  }
}
