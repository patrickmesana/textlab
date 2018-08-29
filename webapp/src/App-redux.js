import {combineReducers} from 'redux';
import distributionExplorer from './DistributionExplorer-redux'
import trends from './Trends-redux'

export default combineReducers({
    distributionExplorer,
    trends
});