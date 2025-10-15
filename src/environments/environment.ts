export const environment = {
  production: true, // Change to true to activate production environment
  apiUrlDev: 'http://localhost:8070/api',
  apiUrlProd: 'https://angular-artisan-des-saveurs.vercel.app/api'
};
if (environment.production) {
  console.log("✅ Environment de Prduction chargé !");
}else{
  console.log("✅ Environment de Développement chargé !");
}