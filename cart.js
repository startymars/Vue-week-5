// import {createApp} from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.26/vue.esm-browser.min.js';

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

console.log(VeeValidate);
console.log(VeeValidateRules);
VeeValidate.defineRule('email', VeeValidateRules['email']);
VeeValidate.defineRule('required', VeeValidateRules['required']);
VeeValidate.defineRule('min', VeeValidateRules['min']);
VeeValidate.defineRule('max', VeeValidateRules['max']);

// //定義規則
// Object.keys(VeeValidateRules).forEach(rule => {
//     if (rule !== 'default') {
//       VeeValidate.defineRule(rule, VeeValidateRules[rule]);
//     }
//   });

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

configure({
  generateMessage: localize('zh_TW'),
});  

const url = 'https://vue3-course-api.hexschool.io/v2'; // 請加入站點
const path = 'cream21'; // 請加入個人 API Path



// VeeValidate.defineRule('email', VeeValidateRules['email']);
// VeeValidate.defineRule('required', VeeValidateRules['required']);

const productModal={
    //當id變動時，取得遠端資料
    props:['id','addToCart','openModal','loadingId'],
    data(){
        return{
            modal:{},
            tempProduct:{},
            qty:1,
        };
    },
    template:`#userProductModal`,
    watch:{
        id(){
            console.log('我在這裡productModal',this.id);
            if(this.id){
                axios.get(`${url}/api/${path}/product/${this.id}`)
                .then((res)=>{
                    console.log('我在這裡單一產品列表',res.data.product);
                    this.tempProduct=res.data.product;
                    console.log(this.tempProduct);
                    this.modal.show();
                    
                })
                .catch((err)=>{
                    console.log(err.data);
                })
            }
        },
        // loadingId(){
        //     console.log('loadingId',this.loadingId);
        // }
    },
    methods:{
        hide(){
            this.modal.hide();
          

        }
    },
    mounted(){
        this.modal = new bootstrap.Modal(this.$refs.modal) //使用bs5 Modal實體取得
        //監聽DOM，當Modal關閉時，要清空id
        this.$refs.modal.addEventListener('hidden.bs.modal', function (event) {
            console.log("被關閉");
            this.openModal('');
            
        })
        
    }
}

const app=Vue.createApp({
    data(){
        return{
            products:[],
            productId:"",
            cart:{},
            loadingItem:"",//存id
            form: {
                user: {
                  name: '',
                  email: '',
                  tel: '',
                  address: '',
                },
                message: '',
            },
        }
    },
    methods:{
        onSubmit() {
            console.log(this.form);
        },
        isPhone(value){
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        },
        getProducts(){
            axios.get(`${url}/api/${path}/products/all`)
                .then((res)=>{
                    console.log('產品列表',res.data.products);
                    this.products=res.data.products;
                    console.log(this.products);
                 })
                 .catch((err)=>{
                    console.log(err.data.message);
                })
        },
        openModal(id){
            this.productId=id;
            this.loadingItem=id;
            console.log("外層傳入",this.productId);
            console.log("loading",this.loadingItem);
        },
        addToCart(product_id,qty=1){ //當沒有參數傳入帶入預設值
            const data={
                product_id, //同名不寫第二次
                qty
            }
            this.loadingItem=product_id;
            axios.post(`${url}/api/${path}/cart`,{data})
                .then((res)=>{
                    console.log('加入購物車:',res.data);
                    this.$refs.productModal.hide();
                    this.loadingItem="";
                    this.getCarts();
                 })
                 .catch((err)=>{
                    console.log(err.data.message);
                })
        },
        getCarts(){
            axios.get(`${url}/api/${path}/cart`)
            .then((res)=>{
                console.log('取得購物車',res.data.data);
                this.cart=res.data.data;
                console.log("查看有沒有準確存入",this.cart);
            })
            .catch((err)=>{
                console.log(err.data.message);
            })
        },
        updateCartItem(item){ //購物車的id、產品的id
            const data={
                product_id:item.product.id, //同名不寫第二次
                qty:item.qty
            };
            this.loadingItem=item.id;
            axios.put(`${url}/api/${path}/cart/${item.id}`,{data})
                .then((res)=>{
                    console.log("更新購物車",res.data);
                    this.getCarts();
                    this.loadingItem="";
                })
                .catch((err)=>{
                    console.log(err.data.message);
                })
        },
        deleteCartItem(item){ //刪除指定品項
            this.loadingItem=item.id;
            axios.delete(`${url}/api/${path}/cart/${item.id}`)
            .then((res)=>{
                console.log("刪除購物車品項",res.data);
                this.getCarts();
                this.loadingItem="";
            })
            .catch((err)=>{
                console.log(err.data.message);
            })
        },
        deleteCarts(){ //清空購物車
            axios.delete(`${url}/api/${path}/carts`)
                .then((res)=>{
                    console.log(res.data.message);
                    this.getCarts();
                })
                .catch((err)=>{
                    console.log(err.data.message);
                    alert(err.data.message);
                })
        },
        createOrder() { //送出結帳
            const order = this.form;
            axios.post(`${url}/api/${path}/order`, { data: order })
                .then((res) => {
                    alert(res.data.message);
                    this.$refs.form.resetForm();
                    this.getCarts();
                })
                .catch((err) => {
                    console.log(err.data.message);
                    });
                },

    },
    components:{
        productModal
    },
    mounted(){
        this.getProducts();
        this.getCarts();
    }   
});

//註冊元件
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');

