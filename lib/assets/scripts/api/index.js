'use strict';

const API_ROOT = `${window.location.origin}/api`
const API_PROJECT_PATH = `${API_ROOT}/project`

function fetchProject(){
  return Vue.http.get(API_PROJECT_PATH, {responseType: 'json'}).then((r) => r.body)
}

function deleteProject(id){
  return Vue.http.delete(`${API_PROJECT_PATH}/${id}`, {responseType: 'json'}).then((r) => r.body)
}

function fetchProjectStats(id){
  return Vue.http.get(`${API_PROJECT_PATH}/${id}/stats`, {responseType: 'json'}).then((r) => r.body)
}

function fetchProjectData(id){
  return Vue.http.get(`${API_PROJECT_PATH}/${id}/sample_data`, {responseType: 'json'}).then((r) => r.body)
}

function postFeedback(data){
  return Vue.http.jsonp(`http://tarantula.tech/api/feedback`, {params: data}, {responseType: 'json'}).then((r) => r.body)
}

function startProject(id){
  return Vue.http.post(`${API_PROJECT_PATH}/${id}/start`, {responseType: 'json'}).then((r) => r.body)
}

function resetProject(id){
  return Vue.http.post(`${API_PROJECT_PATH}/${id}/reset`, {responseType: 'json'}).then((r) => r.body)
}
