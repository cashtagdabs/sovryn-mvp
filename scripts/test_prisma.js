(async()=>{
  try{
    const {PrismaClient}=require('@prisma/client');
    const p=new PrismaClient();
    console.log('PrismaClient created');
    await p.$disconnect();
    console.log('Disconnected');
  }catch(e){
    console.error('ERR',e);
    process.exit(1);
  }
})();
