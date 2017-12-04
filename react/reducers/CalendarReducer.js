import {CALENDAR_PAGE_ADD_SCHEDULE_TO,
        CALENDAR_PAGE_CHANGE_DAYS,
        CALENDAR_PAGE_CHANGE_GET_JOBS,
        CALENDAR_PAGE_ADD_RECURRING_TO_DATE,
        CALENDAR_PAGE_MOVE_DEP_SIDE_BY_SIDE ,
        CALENDAR_PAGE_MOVE_DEP_SBS_UPDATE_DB,
        CALENDAR_PAGE_REFRESH,
        RESET_ALL_ACTION} from '../common/Constants';

const CalendarReducer = function (state=[], action) {
    switch (action.type){
        // ADD FROM CALENDAR TO SCHEDULER RIGHT SIDE BAR
        case CALENDAR_PAGE_ADD_SCHEDULE_TO:
            const action_state = Object.assign({},state,{action: action.action });
            return action_state;
            break;

        // REFRESH THE CALENDAR PAGE
        case CALENDAR_PAGE_REFRESH:
            const calendar_state_job = Object.assign({},state,{calendar_jobs: action.calendar_jobs });
            return calendar_state_job;
            break;

        // FOR UPDATING CALENDAR DAYS
        case CALENDAR_PAGE_CHANGE_DAYS:
            const days_state = Object.assign({},state,{days: action.days});
            return days_state;
            break;

        //  FOR GETTING THE JOBS WHEN CALENDAR DAYS HAVE CHANGE
        case CALENDAR_PAGE_CHANGE_GET_JOBS:
            const jobs_state = Object.assign({},state,{calendar_jobs : action.calendar_jobs});
            return jobs_state;
            break;

        //  FOR UPDATING JOB BAG DEPARTMENT IN THE DATABASE
        //  AT THE MOMENT ITS JUST HERE FOR FUTURE PURPOSES
        case CALENDAR_PAGE_MOVE_DEP_SBS_UPDATE_DB:
            return state;
            break;

        // SCHEDULLING ALL RECURRING JOBS TO THE SCHEDULE
        case CALENDAR_PAGE_ADD_RECURRING_TO_DATE:
            const nextAction  = action.action;
            const add_recur_state    = {...state,action: nextAction};
            return add_recur_state;
            break;

        // FOR MOVING JOB DEPARTMENTS  TO DIFFERENT JOB
        case CALENDAR_PAGE_MOVE_DEP_SIDE_BY_SIDE:
            // This clones the calendar_job itself, removes the old position and set it to the new position
            // if you are in saturday and sunday it will just stays there if you beyond the scope of days

            let newCalendarJobs      = Object.assign({}, state.calendar_jobs);
            let jobCopy   = Object.assign({},newCalendarJobs[action.info.dayKey][action.info.deptId][action.info.jobId]);
            delete newCalendarJobs[action.info.dayKey][action.info.deptId][action.info.jobId];
            newCalendarJobs[action.info.toKey][action.info.deptId][action.info.jobId] = jobCopy;

            const  newCJobsState = Object.assign({},state,{calendar_jobs : newCalendarJobs});
            return newCJobsState;
            break;

        case RESET_ALL_ACTION:
            // RESET ALL ACTION IF NEEDED
            const  newState = Object.assign({},state,{ action: action.action });
            return newState;
            break;
        default:
            return state;
    }
    return state;
}
export default CalendarReducer ;
