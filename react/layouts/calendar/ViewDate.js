import React, { Component } from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {NavLink} from 'react-router-dom';

import moment from 'moment';
import DatePicker from 'react-datepicker';

// CUSTOM COMPONENT
import util from '../../common/edlibrary';
import CalendarRow      from "../../components/calendar/CalendarRow";
import ProgrammerRow    from '../../components/calendar/common/ProgrammerRow';
import {getLoader,
        displayWorkingLoading}      from '../../common/CommonUI';


// Get actions for calendar page
import {calendar_view_day_set_calendar_date,
        calendar_page_view_date_get_jobs,
        calendar_main_page_refresh} from '../../actions/CalendarActions';

class ViewDate extends Component {
    constructor(props){
        super(props);

        this.state = {
            isLoading: true,
            calendar_date: moment()
        }
        this.handleCalendarFunction     = this.handleCalendarFunction.bind(this);
        this.handleChangeCalendarDate   = this.handleChangeCalendarDate.bind(this);
        this.renderHeader1          = this.renderHeader1.bind(this);
        this.renderHeader2          = this.renderHeader2.bind(this);
        this.renderHeader3          = this.renderHeader3.bind(this);
        this.goToMain               = this.goToMain.bind(this);

        // Populating colours for view date
        this.populate_colour_settings  = this.populate_colour_settings.bind(this);
    }
    populate_colour_settings(){}
    goToMain(e){
        const newMoment = util.getWeekFromDate( moment(this.props.calendar_page.selected_date, "DD/MM/YYYY"));
        this.props.calendar_view_day_set_calendar_date(newMoment, this.state.calendar_date);
        this.props.calendar_main_page_refresh();
        e.preventDefault();

        // this changes the URL in the web-address text field
        const { history } = this.props;
        history.push('/calendar/');
    }
    handleChangeDates(num){
        let thisdate       = moment(this.state.calendar_date);
        thisdate.add(num,'days');
        this.handleCalendarFunction(thisdate);
    }
    handleCalendarFunction(date){
        //CHANGE DATE AND GET THE CALENDAR DATE
        this.setState(function(state,props){
            return ({calendar_date: date});
        }, this.handleChangeCalendarDate);
    }
    handleChangeCalendarDate(){

        const selectedDate = this.state.calendar_date;
        this.props.calendar_view_day_set_calendar_date(
            [{day: selectedDate.format('dddd'), date: selectedDate.format('DD/MM/YYYY')}],
            selectedDate
        );

        // this changes the URL in the web-address text field
        const { history } = this.props;
        history.push('/calendar/' + selectedDate.format('DD-MM-YYYY'));

        // call to get the jobs from the view date
        this.props.calendar_page_view_date_get_jobs(this.props.settings, selectedDate.format('DD/MM/YYYY'));
    }
    shouldComponentUpdate(nextProps,nextState){
        console.log("CALLING!");
        return true;
    }
    componentWillReceiveProps(nextProps){
        if(nextProps.view_date_jobs){
            this.setState((prevState, props) => (
                {isLoading: false}
            ));
        }
    }
    renderDepartments(){

        let rowsCollection  = [];
        const programmingID = this.props.settings.programmingUsers.deptId;
        const programmingU  = this.props.settings.programmingUsers.value;
        const departments   = this.props.dep;

        // RECURSING OVER DEPARTMENTS ORDER
        function inlineRecursive(item,rowcollection){
            const title     = item.title;               // department title
            const id        = item.id;                  // department id
            const numkids   = item.kids.length;         // department children
            const isParent  = (numkids>0);

            if(numkids>0){
                rowcollection.push(<CalendarRow key={id} title={title} isParent={isParent}  departmentId={id} isViewDate={true} departments={departments} />);

                // IF DEPARTMENTS ID MATCHED PROGRAMMING ID ADD, ROWS FOR THE PROGRAMMERS

                for(let value of item.kids){
                    inlineRecursive(value,rowcollection);
                }

            }else{

                // THIS IS WHERE YOU PRINT OUT THE DEPARTMENT
                rowcollection.push(<CalendarRow key={id} title={title} isParent={isParent}  departmentId= {id} isViewDate={true} departments={departments}/>);

                // DISPLAY THE ROW FOR THE PROGRAMMER
                if(programmingID == id){
                    programmingU.map((item , n)=>{

                            // CAPTURE THE JOBS FOR THAT PARTICULAR PROGRAMMER
                            rowcollection.push(<ProgrammerRow key={"pr_"+ n} user={item} isParent={isParent}  departmentId= {id} counter={n} isViewDate={true} departments={departments}/>);
                        }
                    )
                }
            }
        }
        this.props.dep.departmentsOrder.map(function(item,i){
            inlineRecursive(item,rowsCollection);
        })
        return (rowsCollection);
    }
    renderContent(){
        return(
            <div className="third">
                <div className="left">
                    <table className="ui fixed single purple unstackable celled table">
                        <thead>
                        <tr>
                            <th className="header_department_label">Departments</th>
                            <th>Jobs</th>
                        </tr>
                        </thead>
                        <tbody>

                        {this.renderDepartments()}
                        </tbody>
                    </table>
                </div>
                <div className="right">
                </div>
            </div>
        );
    }
    renderHeader1(){
        return(
            <div className="first">
                <div className="left">
                    <h2 className="title">
                        <img src="assets/img/scheduler_icon.svg" width="30" height="30" className="calendar_icon"/> Scheduled Jobs
                    </h2>
                </div>
                <div className="right">
                    <span className="calendar_holder">
                            <span className="ui input">
                                 <i className="calendar large icon"></i>
                              <DatePicker
                                  selected={this.state.calendar_date}
                                  onChange={(date) => {
                                    this.handleCalendarFunction(date);
                                  }
                                  }
                                  dropdownMode="select"
                                  showMonthDropdown
                                  showYearDropdown
                                  dateFormat="DD/MM/YYYY"
                                  className="mini_calendar_text_field"
                                  todayButton={"Today"}

                              />
                            </span>
                    </span>
                </div>
            </div>

        );
    }
    renderHeader2(){
        return(
            <div className="second">

                <div className="date_range head_link">
                    <div className="day_label">
                        {this.state.calendar_date.format("dddd")}
                    </div>
                            <span className="previous">
                                <a className="click_prev" onClick={() => {
                                    this.handleChangeDates(-1);
                                }}><i className="chevron circle left icon"></i></a>
                            </span>
                    <span className="range_date">
                        {this.state.calendar_date.format("DD/MM/YYYY")}
                    </span>
                    <span className="next">
                                <a className="click_next" onClick={() => {
                                    this.handleChangeDates(1);
                                }}><i className="chevron circle right icon"></i></a>
                    </span>
                </div>
            </div>

        );
    }
    renderHeader3(){
        return(
            <div className="fourth">
                <div className="left">
                    <div className="working">
                        {displayWorkingLoading(this)}
                    </div>
                    <NavLink to={"/calendar/"} className="back_to_calendar" onClick={this.goToMain}><i className="caret left icon"></i> BACK TO CALENDAR</NavLink>
                </div>
                <div className="right">

                </div>
            </div>

        );
    }
    componentDidMount(){
        // Get the date from the URL and get the jobs for that particular date
        const currentDate = moment(this.props.match.params[0], "DD-MM-YYYY");
        this.setState(function(state,props){
            return (
                {calendar_date: currentDate}
            );
        },this.handleChangeCalendarDate);

    }
    render(){
        if(this.state.isLoading){
            return(
                <div className="calendar_view_date">
                    {this.renderHeader1()}
                    {this.renderHeader2()}
                    {getLoader()}
                </div>
            );
        }else{

            return(
            <div className="calendar_view_date">
                {this.renderHeader1()}
                {this.renderHeader2()}
                {this.renderHeader3()}
                {this.renderContent()}
            </div>);
        }
    }
}
function mapStateToProps(state,ownprops) {
    return ({
        settings: state.settings,
        calendar_page: state.calendar_page,
        view_date_jobs: state.calendar_page.view_date_jobs
    })
}
function mapDispatchToProps(dispatch){
    return({
        calendar_view_day_set_calendar_date: (days,selected_date)=>{
            dispatch(calendar_view_day_set_calendar_date(days,selected_date))
        },
        calendar_page_view_date_get_jobs: (settings, date)=>{
            dispatch(calendar_page_view_date_get_jobs(settings , date))
        },
        calendar_main_page_refresh: ()=>{
            dispatch(calendar_main_page_refresh())
        }
    })
}
export default withRouter(connect(mapStateToProps,mapDispatchToProps)(ViewDate));
