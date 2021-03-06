import React, { Component } from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import axios from 'axios';
import {withRouter } from 'react-router-dom';
import { ChromePicker } from 'react-color';

// UI Common functionality
import {showJobType,showDropDown} from "../../common/CommonUI";
import {Message} from "semantic-ui-react";

// Get actions to save/new/edit
import {manage_job_add_new_edit} from '../../actions/ManageJobsActions';

let c = 0;
class AddEditJobForm extends Component {
    constructor(props){
        super(props);

        let settings        = this.props.settings;
        this.api_folder     = settings.setting.react_api_folder;
        this.job_status     = settings.setting.job_status;

        this.state = {
            displayColorPicker: false,
            job: {
                job_id: 0,
                job_prism_job_id: 0,
                job_prism_job_id: 0,
                job_prism_number: 0,
                job_title: "",
                job_colour: "#ffffff",
                job_print_date: "",
                job_due_date: "",
                job_lodge_date: "",
                job_reports_ids:"",
                job_comments: "",
                job_status: "stand by",
                job_qty: 0,
                job_type: "once",
                job_departments: [],
                job_dp_date: "",
                job_customer_name: ""
            },

            isSearching: 0,
            isSaving: 0,
            jobsFound: [],
            err: 0,
            msg: "",

            // For programming section allocation

            programmers_options:[],
            programmers_list: {},

            // For recurring departments assign programmers
            recurring_departments_options: [
                {key: 'seven', text: '7 days ago', value: 7},
                {key: 'fourteen', text: '2 weeks ago', value: 14},
                {key: 'thirtyone', text: '1 month ago', value: 31}
            ],
            recurring_days_ago_selection: "",
            recurring_departments_jobs: [],
            dep_id: this.props.match.params.depid,

            // Variables for assigning programmers selection
            programmers_selection: "",
            recurring_departments_job_selection: ""
        };

        // console.log("From addeditjobform ",settings);
        // DEVELOPER FUNCTIONS

        this.prepopulateFromPrism       = this.prepopulateFromPrism.bind(this);
        this.saveOrEdit                 = this.saveOrEdit.bind(this);
        this.changeValue                = this.changeValue.bind(this);
        this.prepopulateSelect          = this.prepopulateSelect.bind(this);

        this.prepopulateJobBag          = this.prepopulateJobBag.bind(this);
        this.prepopulateClear           = this.prepopulateClear.bind(this);
        this.getApiProgrammersSection   = this.getApiProgrammersSection.bind(this);
        this.getApiJobDepartments       = this.getApiJobDepartments.bind(this);
        this.getApiProgrammers          = this.getApiProgrammers.bind(this);

        // Helper function
        this.isProgrammersDepSelected   = this.isProgrammersDepSelected.bind(this);

        // Element handles event

        this.handleDepartmentChange     = this.handleDepartmentChange.bind(this);
        this.handleJobTypeChange        = this.handleJobTypeChange.bind(this);
        this.handleProgrammersAssign    = this.handleProgrammersAssign.bind(this);
        this.handleRecurringDaysAgo     = this.handleRecurringDaysAgo.bind(this);
        this.handleDepartmentListSelect = this.handleDepartmentListSelect.bind(this);
        this.handleColorPickerOpen      = this.handleColorPickerOpen.bind(this);
        this.handleColorPickerClose     = this.handleColorPickerClose.bind(this);
        this.handleColorPickerChange    = this.handleColorPickerChange.bind(this);

        // Render Functions for other parts
        this.renderAssignProgrammer     = this.renderAssignProgrammer.bind(this);
        this.showMessage                = this.showMessage.bind(this);
    }
    handleColorPickerOpen(){ this.setState({ displayColorPicker: !this.state.displayColorPicker })}
    handleColorPickerClose(){this.setState({ displayColorPicker: false }) }
    handleColorPickerChange(color){
        const job = Object.assign({}, this.state.job, {job_colour: color.hex});
        this.setState({job},()=>{
            console.log("COLOR CHANGE: ", job.job_colour);
        });
    }

    // This will trigger when receiving a state change from global
    componentWillReceiveProps(nextProps){

        if (nextProps.manage_job_add_new_edit && nextProps.manage_jobs.resp) {
            const newData    = nextProps.manage_jobs.resp;
            const currentJob = this.state.job;

            console.log("Component will received from api: ",nextProps);
            const job  = newData.job;
            const msg  = newData.msg;
            const err  = newData.error;


            // UPDATE THE STATE NOW TO THE NEWLY CREATED JOB
            this.setState((prevState, props) => (
                {
                    job: job ,
                    isSaving: 0,
                    msg,
                    err
                }
            ));

        }

    }
    componentDidMount(){
        // Get job bag from url ID
        this.prepopulateJobBag();
        console.log("AddEditJobForm: ",this.props);



        // Jquery DatePicker on change has to fire twice to update the ui
        let changeCalendar = this.changeValue;
        $('#job_due_date').datepicker({dateFormat: "dd/mm/yy",setDate: new Date(),changeYear: true, changeMonth: true }).on("input change",function(e){
            changeCalendar(e);
        });
        $('#job_print_date').datepicker({dateFormat: "dd/mm/yy",setDate: new Date(),changeYear: true, changeMonth: true }).on("input change",function(e){
            changeCalendar(e);
        });
        $('#job_lodge_date').datepicker({dateFormat: "dd/mm/yy",setDate: new Date(),changeYear: true, changeMonth: true }).on("input change",function(e){
            changeCalendar(e);
        })
        ;$('#job_dp_date').datepicker({dateFormat: "dd/mm/yy",setDate: new Date(),changeYear: true, changeMonth: true }).on("input change",function(e){
            changeCalendar(e);
        });
        // ----------------------------------------------------------------------------
        // Note: Creating and Editing a job is different.
        // Creating a job: When creating a job you need to allocate department date,
        // for the department tasks needs to be  present.
        // Editing a job: You dont need scheduled date
        // Apply the validation rule when creating a new job turn into editing mode.
        // ----------------------------------------------------------------------------

        // VALIDATION INITIALIZATION 1: FOR CREATING
        $('.ui.form')
            .form({
                on: 'blur',
                fields: {
                    job_title: {
                        identifier: 'job_title',
                        rules: [
                            {
                                type   : 'empty',
                                prompt : 'Please enter job title'
                            }
                        ]
                    },
                    job_departments: {
                        identifier: 'job_departments',
                        rules: [
                            {
                                type   : 'empty',
                                prompt : 'Please choose at least one department.'
                            }
                        ]
                    },
                    job_dp_date: {
                        identifier: 'job_dp_date',
                        rules: [
                            {
                                type   : 'empty',
                                prompt : 'You must enter a scheduled date.'
                            }
                        ]
                    }
                }
            });

            

    }

    isProgrammersDepSelected(){
        return ($.inArray( parseInt(this.props.programming_dept_id) ,this.state.job.job_departments)>=0);
    }
    handleProgrammersAssign (e, {value}){
        this.setState((prevState, props) => (
            {programmers_selection: value }
        ));
    }
    // API QUERY: For multiple API queries for programming section
    getApiProgrammersSection(){

        // Only get assign programmers section when the department selected has programming as one of its department

        if(this.isProgrammersDepSelected()){
            this.getApiJobDepartments();
            this.getApiProgrammers();


        }else{
            // Else empty the array of the programmers
            this.setState((prevState, props) => (
                { programmers_selection: "", programmers_options: []}
            ));
        }
    }


    // Query all programmers to be use for the programmer combo box
    getApiProgrammers(){

        const req               = this.props.settings.setting.react_api_folder+'misc_actions/get_programmers.php';
        const prom_programmers  = axios.get(req);


        prom_programmers.then((res)=>{
                let programmers = res.data.payload;
                this.setState((prevState, props) => (
                    {programmers_options: programmers}
                ));
            }
        )
    }

    // API QUERY: To get all the departments associate with the job bag
    getApiJobDepartments(){

        // Check if the job is recurring cause they will be multiple programming section for a recurring job
        // And if you are creating a job dont show the job departments as you dont have a job department created yet.
        if(this.state.job.job_type=='recurring' && this.state.job.job_id!=0){
            const num_days = (this.state.recurring_days_ago_selection!="")?this.state.recurring_days_ago_selection:0;
            const req  = this.props.settings.setting.react_api_folder+'/misc_actions/get_jobbags_departments.php?num_days_ago=' + num_days + '&job_id=' + this.state.job.job_id + '&department_id='+ this.props.programming_dept_id + '&dep_id=' + this.state.dep_id;

            console.log("DEPARTMENT REQUEST: ", req);

            const prom_programmers = axios.get(req);
            prom_programmers.then((res)=>{
                    const departments       = res.data.payload;
                    const programmers_list  = res.data.list;

                    this.setState((prevState, props) => (
                        {recurring_departments_jobs: departments, programmers_list: programmers_list}
                    ), ()=>{

                        // after preloading pre-select the department
                        if(this.state.dep_id!=='undefined'){
                            const programmer    = programmers_list[this.state.dep_id];
                            const programmers_selection = (programmer!=null)? programmer.login_id: "";

                            this.setState((prevState, props) => (
                                {recurring_departments_job_selection: parseInt(this.state.dep_id), programmers_selection}
                            ));
                        }
                    });

                }
            )
        }
    }

    // Render the assign programmers section of the form
    renderAssignProgrammer(){

        // --------------------------------------------------------
        // Job departments drop down for Editing a recurring job
        // --------------------------------------------------------


        let RecurringDepartmentsDropDown = () => {
            return (<div></div>);
        }

        let RecurringDepartments = () => {
            return (<div></div>);
        }
        // Show selected departments onyl for recurring job and is in editing mode
        if(this.state.job.job_type == 'recurring' && this.state.job.job_id !=0){
            RecurringDepartmentsDropDown = () => {
                return (
                    <div>
                        <div className="field">
                            <label><i className="file text outline icon"></i>Select existing department</label>
                        </div>
                        <div className="two fields">
                            <div className="field">
                                {
                                    showDropDown
                                    (
                                        this.state.recurring_departments_options,
                                        this.state.recurring_days_ago_selection,
                                        this.handleRecurringDaysAgo,
                                        "Pick number of days",
                                        "job_departments_recurring_days_ago",
                                        true
                                    )
                                }
                            </div>
                            <div className="field">
                                {
                                    showDropDown
                                    (
                                        this.state.recurring_departments_jobs,
                                        this.state.recurring_departments_job_selection,
                                        this.handleDepartmentListSelect,
                                        "Select department to update programmer assignment",
                                        "job_departments_list",
                                        true,
                                        true
                                    )
                                }
                            </div>
                        </div>
                    </div>

                );
            }
        }
        // --------------------------------------------------------
        // Programmers drop down
        // --------------------------------------------------------

        const ProgrammersDropdown = ()=>{
            return(
                <div className="field">
                    <label><i className="user circle icon" aria-hidden="true"></i> Assign programmer to a job </label>
                    <input type="hidden" name="job_dp_allocated_to" id="job_dp_allocated_to" value={this.state.programmers_selection}/>
                    {
                        showDropDown
                        (
                            this.state.programmers_options,
                            this.state.programmers_selection,
                            this.handleProgrammersAssign,
                            "Pick a programmer",
                            "job_departments",
                            true,
                            true
                        )
                    }
                </div>
            );
        }


        // Only show the programming department is selected.
        if(this.isProgrammersDepSelected()){

            
            
            return (
                <div className="job_bag_programmer_assignment">
                    <RecurringDepartmentsDropDown /> 
                    <ProgrammersDropdown/>
                </div>
            );
        }
    }
    // Save the job created/edited

    saveOrEdit(e){

        // e.preventDefault(); // Prevent form to be submitted naturally
        const jobData = Object.assign({},this.state.job,
            {
                selected_programming_dept: this.state.recurring_departments_job_selection,
                selected_programmer: this.state.programmers_selection,
                programming_dept_id: this.props.programming_dept_id
            });

        // Validate your Job creation here
        if($('.ui.form').form("is valid")){
            
            this.setState((prevState, props) => ({isSaving: 1}) );
            this.props.manage_job_add_new_edit(this.props.settings,jobData);
        }

    }

    // Change value from form element to the state of the component
    changeValue(e){
        let input_name = e.target.name;
        let input_value= e.target.value;

        let job = Object.assign(this.state.job,{});
        job[input_name] = input_value;


        this.setState((prevState,props)=>{
                return ({job});
            }
        ); // Update the fields of the data
    }

    // Get the jobbag from database and start editing
    prepopulateJobBag(){
        
        const {history,match} = this.props;
        const jobId           = parseInt(match.params.jobid);

        // Check if the job number id

        if(jobId!="NaN" && jobId>0){
            const req  = this.props.settings.setting.react_api_folder+'/manage_jobs_actions/manage_jobs_get.php?job_id='+jobId;

            console.log("Prepopulate Request:  ", req);

            // Acquire from Prism get API
            axios.get(req).then(function(res){
                const job       = res.data.job;

                // ----------------------------
                // Preselect the programmer
                let programmer  = "";
                if("programmer" in job){
                    programmer  = job.programmer.userid;
                }
                // ----------------------------

                // CONTINUE WITH EDITING EXISTING
                if(res.data.error==0 ){
                    this.setState((prevState, props) => (
                        {
                            job: job ,
                            programmers_selection: programmer
                        }
                    ), ()=>
                        {
                            // Check the programmer section the form
                            this.getApiProgrammersSection();
                        }
                    );

                    console.log("Prepopulate Result: ",job);


                    // VALIDATION INITIALIZATION 2: FOR EDITING
                    $('.ui.form')
                        .form({
                            on: 'blur',
                            fields: {
                                job_title: {
                                    identifier: 'job_title',
                                    rules: [
                                        {
                                            type   : 'empty',
                                            prompt : 'Please enter job title'
                                        }
                                    ]
                                },
                                job_departments: {
                                    identifier: 'job_departments',
                                    rules: [
                                        {
                                            type   : 'empty',
                                            prompt : 'Please choose at least one department.'
                                        }
                                    ]
                                }
                            }
                        });
                }else{
                   // NO AVAILABLE JOB WITH THE PARTICULAR JOB ID REDIRECT 
                    history.push('/managejobs/newedit/');
                }

            }.bind(this))

        // If length of the path name is 4, somebody is trying to edit something that doesnt exist.
        // redirect them
        }

    }

    // Select number of days ago the list of departments will get
    handleRecurringDaysAgo(e, {value}){

        this.setState((prevState, props) => (
            { recurring_days_ago_selection: value }
        ), ()=>{
            // GET LIST OF DEPARTMENTS FROM A JOB
            this.getApiJobDepartments();
        });
    }
    handleDepartmentListSelect(e, {value}){

        const programmer        = this.state.programmers_list[value];
        let programmer_selected = "";

        if(programmer!=null && value!=""){
            programmer_selected = programmer.login_id;
        }

        this.setState((prevState, props) => (
            { recurring_departments_job_selection: value, programmers_selection: programmer_selected }
        ));
    }
    // Select departments on change
    handleDepartmentChange(e,{value}){

        const prevJobDepartments = _.cloneDeep(this.state.job.job_departments);
        const curJobDepartments  = {value}.value;
        const job = Object.assign({},this.state.job,{job_departments: curJobDepartments });

        this.setState((prevState, props) => ({
            job
        }), this.getApiProgrammersSection); // Initialize assign programmers on change

    }
    // Job type recurrence or once
    handleJobTypeChange(e){
        let value = e.target.value;
        const job     = Object.assign(this.state.job,{job_type: value});

        if(value=='once'){

            // If once off job clear the recurring_departments

            this.setState((prevState,props)=>{
                    return ({job,recurring_departments_job_selection: ""});
                }
            );

        }else{
            this.setState((prevState,props)=>{
                    return ({job});
                }
            );
        }

    }
    // Select and prepopulate the form with the selected jobbag from prism
    prepopulateSelect(jobsKey){
        let jobs = JSON.parse(JSON.stringify( this.state.jobsFound));
        let job  = jobs[jobsKey];
        const newJob = Object.assign({},job,{
            job_id: 0,
            job_comments: this.state.job.comments,
            job_type: this.state.job.job_type,
            job_departments: this.state.job.job_departments
        });

        this.setState((prevState,props)=>{
                return ({
                    job: newJob
                })
            }
        );
    }

    // Grab jobs already in prism
    prepopulateFromPrism(event){

        this.setState({ isSearching: 1});
        let typeSearch = event.target.value;
        let jobsFound = this.state.jobsFound;


        // Create a delay when typing
        var timer;
        if(typeSearch.length>4){
            clearTimeout(timer);
            var ms = 200;
            timer = setTimeout(()=>{

                const reactApiPrePop = this.api_folder+'manage_jobs_prepopulate.php?q='+typeSearch;
                const promiseJobResult = axios.get(reactApiPrePop);
                console.log("Prepopulate URL: ", reactApiPrePop);

                promiseJobResult.then((res)=>{
                        let jobs = res.data;

                        console.log("Prepopulate: ",jobs);
                        this.setState((prevState,props)=>{
                                return {jobsFound: jobs,isSearching: 0}
                            }
                        );
                    }
                )
            },ms);
        }else if(jobsFound.length>0){
            if(typeSearch.length<=4){
                this.setState((prevState,props)=>{
                        return {jobsFound: [],isSearching: 0}
                    }
                );
            }
        }

    }
    // Clear the jobs from the search prism job
    prepopulateClear() {
        this.setState(function(prevState,props){
            return ({jobsFound: [] });
        });
    }
    // This will display a message after editing or creating new
    showMessage(){
        if(this.state.msg !=""){
            return (<Message success={(this.state.err==0)} negative={(this.state.err==1)}>
                <Message.Header>{this.state.msg}</Message.Header>
            </Message>);
        }
    }
    showHeader(){
        if(this.state.job.job_id>0){
            return (
                <header className="manage_page_ce_header">
                    <span className="head manage_edit">
                       <i className="edit icon"></i> Editing <span className="title">{this.state.job.job_title}</span>
                    </span>
                </header>
            );
        }else{
            return (
                <header className="manage_page_ce_header">
                    <span className="head manage_new">
                       <i className="folder outline icon"></i> Creating new job
                    </span>
                </header>
            );
        }
    }



    render(){
        const popover = {
            position: 'absolute',
            zIndex: '2',
        }
        const cover = {
            position: 'fixed',
            top: '0px',
            right: '0px',
            bottom: '0px',
            left: '0px',
        }

        let elements = this.state.jobsFound.map(
            (element,i) =>{
                if(element.left){
                    return "";
                }
                return (<div className="search_selected">
                    <span>
                        <a href="javascript:;" onClick={() => this.prepopulateSelect(i)}>{element.job_prism_number} {element.job_title}</a>
                    </span>
                </div>);
            }
        );

        // Another way to create a component and must be first letter Cap
        let SearchResult = null;
        if(this.state.jobsFound.length>0){
            SearchResult = () => {
                return (
                    <div>
                        <strong>Search Results</strong> <a onClick={this.prepopulateClear} ><i className="ui remove icon" style={{color: 'black', cursor: 'pointer'}}></i></a><br/>
                        {elements}
                    </div>
                )
            }
        }

        // Get status for the job
        let job_status      = JSON.parse(this.job_status);

        let SelectJobStatus = (props) =>{
            return (
                <select name="job_status" value={this.state.job.job_status} onChange={this.changeValue}>
                    <option value="">Choose job status</option>
                    { job_status.map(function(item,i){
                        return (<option value={item.text} key={i}>{item.text}</option>);
                    })}
                </select>
            );
        }

        let SelectAndRadio = () => {
            return(
                <table className="status_jobtype_bgcolor">
                    <tbody>
                    <tr>
                        <td>
                            <div className="field">
                                <label><i className="fa fa-heart" aria-hidden="true"></i> Status</label>
                                <SelectJobStatus />
                            </div>
                        </td>
                        <td style={{paddingLeft: "20px"}}>
                            {showJobType(this.state.job.job_type,this.handleJobTypeChange,true)}
                        </td>
                        <td>
                            <table className="pick_a_background">
                                <tbody>
                                <tr>
                                    <td>
                                        <div className="color_preview" style={{backgroundColor: this.state.job.job_colour}} onClick={ this.handleColorPickerOpen }>
                                            &nbsp;
                                        </div>
                                    </td>
                                    <td>
                                        <div className="field">
                                            <input type="text" placeholder="Pick a background color" name="job_colour" onClick={ this.handleColorPickerOpen } value={this.state.job.job_colour} readOnly={true}/>
                                            {this.state.displayColorPicker ? <div style={ popover }>
                                                <div style={ cover } onClick={ this.handleColorPickerClose }/>
                                                <ChromePicker
                                                    color={this.state.job.job_colour}
                                                    onChange = {this.handleColorPickerChange}
                                                />
                                            </div> : null}
                                        </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>

                        </td>
                    </tr>
                    </tbody>
                </table>
            );
        }
        const {history,match}   = this.props;
        let jobId               = match.params.jobid;
        if(!jobId) jobId        = 0;

        // If job is recurring get the all recent programming job and select it to be assigned
        // console.log("TEST", this.state.job.job_departments,"|",this.state.job.job_id,"|",this.state.programmers_selection
        //     ,"|", this.state.job.job_qty, "|",this.state.job.job_prism_number, "|",this.state.job.job_customer_name);

        return (
            <div className="manage_job_ce_container">
                <form className="ui form" onSubmit={(e)=>{  e.preventDefault();  }} method="post">
                    <input type="hidden" name="job_id" value={this.state.job.job_id} />
                    {
                        this.showHeader()
                    }
                    {
                        this.showMessage()
                    }

                    <table className="job_bag_add_edit">
                        <tbody>
                        <tr>
                            <td >
                                <div className="ui error message"></div>
                                <div className="field">
                                    <label>

                                        Search for Job bag by Number or Title from PRISM to link and pre-populate the fields [OPTIONAL]
                                    </label>
                                    <input type="text" disabled={jobId?true:false} name="job_search" placeholder="Type Job Number or Title to pre-populate or leave empty." id="job_search" onChange={this.prepopulateFromPrism} />
                                </div>
                                {(SearchResult)?<SearchResult />:""}
                            </td>
                        </tr>
                        <tr>
                            <td >
                                <div className="field">
                                    <label>
                                        <i className="info circle icon"></i>Job Title
                                    </label>
                                    <input type="text" name="job_title" placeholder="Job Title" id="job_title" value={this.state.job.job_title} onChange={this.changeValue}/>
                                </div>
                            </td>

                        </tr>
                        <tr>
                            <td>

                                <div className="three fields">
                                    <div className="field">
                                        <label><i className="fa fa-shopping-bag" aria-hidden="true"></i> Job bag number</label>
                                        <input type="text" name="job_prism_number" placeholder="Job Number" id="job_prism_number" value={this.state.job.job_prism_number}  onChange={this.changeValue}/>
                                    </div>
                                    <div className="field">
                                        <label><i className="calculator icon"></i> Quantity</label>
                                        <input type="text" name="job_qty" placeholder="Job Quantity" id="job_qty" value={this.state.job.job_qty} onChange={this.changeValue}/>
                                    </div>
                                    <div className="field">
                                        <label><i className="user circle icon"></i> Customer Name</label>
                                        <input type="text" name="job_customer_name" placeholder="Customer Name" id="job_customer_name" value={this.state.job.job_customer_name} onChange={this.changeValue}/>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="four fields">
                                    <div className="field">
                                        <label><i className="calendar icon"></i> Scheduled Date </label>
                                        <input type="text" name="job_dp_date" placeholder="DD/MM/YY" id="job_dp_date" value={this.state.job.job_dp_date}/>
                                    </div>
                                    <div className="field">
                                        <label><i className="calendar icon"></i> Due date </label>
                                        <input type="text" name="job_due_date" placeholder="DD/MM/YY" id="job_due_date" value={this.state.job.job_due_date}   />
                                    </div>
                                    <div className="field">
                                        <label><i className="calendar icon"></i> Print date </label>
                                        <input type="text" name="job_print_date" placeholder="DD/MM/YY" id="job_print_date" value={this.state.job.job_print_date}  />
                                    </div>
                                    <div className="field">
                                        <label><i className="calendar icon"></i> Lodgement date </label>
                                        <input type="text" name="job_lodge_date" placeholder="DD/MM/YY" id="job_lodge_date" value={this.state.job.job_lodge_date} />
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <SelectAndRadio />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="field">
                                    <label><i className="fa fa-tasks" aria-hidden="true"></i> Create Department Tasks</label>
                                    <input type="hidden" name="job_departments" id="job_departments" value={this.state.job.job_departments}/>
                                        {
                                            showDropDown(
                                            this.props.settings.departmentOptions,
                                            this.state.job.job_departments,
                                            this.handleDepartmentChange,
                                            "Pick departments",
                                            "job_departments")
                                        }
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className="field">
                                    <label><i className="fa fa-comment" aria-hidden="true"></i> Comments</label>
                                    <textarea name="job_comments" onChange={this.changeValue} value={this.state.job.job_comments}></textarea>
                                </div>

                            </td>
                        </tr>
                        <tr>
                            <td>
                                { this.renderAssignProgrammer()}
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <br/>
                                <button className={"positive ui button "+(this.state.isSaving?"loading":"")}
                                        onClick={this.saveOrEdit} ><i className="save icon"></i> Save</button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </form>
            </div>
        );
    }


}
function mapStateToProps(state,ownprops) {
    return{
        settings: state.settings,
        manage_jobs: state.manage_jobs,
        programming_dept_id: parseInt(state.settings.setting.programming_dept_id)
    }
}
function mapDispatchToProps(dispatch){
    return{
        manage_job_add_new_edit: (settings, job)=>{
            dispatch(manage_job_add_new_edit(settings, job));
        }
    }
}
export default withRouter(connect(mapStateToProps,mapDispatchToProps)(AddEditJobForm));
