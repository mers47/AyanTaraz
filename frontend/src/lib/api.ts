import axios from 'axios';
const A=process.env.NEXT_PUBLIC_API_URL||'';
const apiBase=A?`${A}/api`:'/api';
const api=axios.create({baseURL:apiBase,timeout:30000,withCredentials:true,headers:{'Content-Type':'application/json'}});
api.interceptors.response.use(r=>r,async e=>{const o=e.config;if(e.response?.status===401&&!o._retry){o._retry=true;try{await axios.post(`${apiBase}/auth/refresh`,{},{withCredentials:true});return api(o)}catch(x){if(typeof window!=='undefined')window.location.href='/admin';return Promise.reject(x)}}return Promise.reject(e)});
export const authApi={sendOTP:(p:string)=>api.post('/auth/send-otp',{phone:p}),login:(p:string,c:string)=>api.post('/auth/login',{phone:p,code:c}),refresh:()=>api.post('/auth/refresh'),logout:()=>api.post('/auth/logout')};
export const taxAssistantApi={startSession:(q?:string)=>api.post('/tax-assistant/start',{questionId:q}),answerQuestion:(s:string,q:string,o:string,v:string)=>api.post('/tax-assistant/answer',{sessionId:s,questionId:q,optionId:o,optionValue:v})};
export const adminApi={getDashboardStats:()=>api.get('/admin/dashboard'),getRecentActivity:(l?:number)=>api.get('/admin/recent-activity',{params:{limit:l}}),getUsers:(p?:number,l?:number,s?:string)=>api.get('/admin/users',{params:{page:p,limit:l,search:s}}),getAuditLogs:(pr?:any)=>api.get('/admin/audit-logs',{params:pr}),
// Chatbot Q&A
getTaxQuestions:()=>api.get('/admin/tax-questions'),createTaxQuestion:(d:any)=>api.post('/admin/tax-questions',d),updateTaxQuestion:(id:string,d:any)=>api.patch(`/admin/tax-questions/${id}`,d),deleteTaxQuestion:(id:string)=>api.delete(`/admin/tax-questions/${id}`),
createTaxQuestionOption:(d:any)=>api.post('/admin/tax-question-options',d),updateTaxQuestionOption:(id:string,d:any)=>api.patch(`/admin/tax-question-options/${id}`,d),deleteTaxQuestionOption:(id:string)=>api.delete(`/admin/tax-question-options/${id}`),
getTaxQuestionFlows:()=>api.get('/admin/tax-question-flows'),createTaxQuestionFlow:(d:any)=>api.post('/admin/tax-question-flows',d),deleteTaxQuestionFlow:(id:string)=>api.delete(`/admin/tax-question-flows/${id}`),
getTaxAssistantResults:()=>api.get('/admin/tax-assistant-results'),createTaxAssistantResult:(d:any)=>api.post('/admin/tax-assistant-results',d),updateTaxAssistantResult:(id:string,d:any)=>api.patch(`/admin/tax-assistant-results/${id}`,d),deleteTaxAssistantResult:(id:string)=>api.delete(`/admin/tax-assistant-results/${id}`),
// Articles
getArticles:(p?:number,l?:number,s?:string)=>api.get('/admin/articles',{params:{page:p,limit:l,search:s}}),getArticle:(id:string)=>api.get(`/admin/articles/${id}`),createArticle:(d:any)=>api.post('/admin/articles',d),updateArticle:(id:string,d:any)=>api.patch(`/admin/articles/${id}`,d),deleteArticle:(id:string)=>api.delete(`/admin/articles/${id}`),getCategories:()=>api.get('/admin/categories'),
// Videos
getVideos:(p?:number,l?:number,s?:string)=>api.get('/admin/videos',{params:{page:p,limit:l,search:s}}),createVideo:(d:any)=>api.post('/admin/videos',d),updateVideo:(id:string,d:any)=>api.patch(`/admin/videos/${id}`,d),deleteVideo:(id:string)=>api.delete(`/admin/videos/${id}`)};
export const contentApi={getAll:()=>api.get('/content'),get:(k:string)=>api.get(`/content/${k}`),save:(k:string,d:any)=>api.put(`/content/${k}`,d),autoFill:()=>api.post('/content/autofill')};
export default api;
