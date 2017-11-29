'use strict';

const API_ROOT = "//lvh.me:3000/api"
const API_PROJECT_PATH = `${API_ROOT}/project`

function fetchProject(){
  return Vue.http.get(API_PROJECT_PATH, {responseType: 'json'})
}
