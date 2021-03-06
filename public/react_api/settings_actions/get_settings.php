<?php

$folder_level = '../';
include('../includes.php');

use Models\SchedSettings;
use Models\Login;
/*
 * PARAMS:
 * Straight forward rest api that grabs all users and settings from the mysql table
 */

$settings       = SchedSettings::all();
$users          = Login::all();

// ***********************************************
$settingArr      = array();
foreach($settings as $val){
    $settingArr[$val->setting_name]                  = array();
    $settingArr[$val->setting_name]['setting_label'] = $val->setting_label;
    $settingArr[$val->setting_name]['setting_value'] = $val->setting_value;
    $settingArr[$val->setting_name]['name']  = $val->setting_name;

}
// ***********************************************
$usersArr       = array();
$c = 0;
foreach($users as $user){
    $usersArr[$c]               = array();
    $usersArr[$c]["id"]         = $user->login_id;
    $usersArr[$c]["username"]   = $user->username;
    $c++;
}
// ***********************************************


$temp = array();
$temp["settings"]   = $settingArr;
$temp["users"]      = $usersArr;


echo json_encode($temp);