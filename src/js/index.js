import '@babel/polyfill';
import 'element-closest-polyfill';
import "./import/modules";

import Vue from 'vue';
import Vuex from 'vuex';
import {getProducts, deleteProducts} from "./import/request";
import table_ui from './components/table_ui.vue';

Vue.use(Vuex);

window.tableStore = new Vuex.Store({
    state: {
        products: [],
        deleteMode: '',
    },
    mutations: {
        setProducts(state, products) {
            state.products = products
        },
        deleteProducts(state, deleteIDs) {


            if (state.deleteMode === 'multi') {
                deleteIDs.forEach(function (item) {
                    state.products.splice(state.products.findIndex(product => product.id === item), 1);
                });
            }
            else if (state.deleteMode === 'one') {
                state.products.splice(state.products.findIndex(product => product.id === deleteIDs), 1);
            }
            // alert(data.resolve.message);
        }
    },
    actions: {
        deleteProducts(context, deleteIDs) {
            deleteProducts().then(
                resolve => {
                    // let data = {
                    //         deleteIDs,
                    //         resolve
                    //     };

                    context.commit('deleteProducts', deleteIDs);
                    alert(resolve.message);
                },
                reject => alert(reject.error)
            )
        }
    }
});

window.mainTable = new Vue({
    el: '#main_table',
    store: tableStore,
    data: {
    },
    components: {
      table_ui
    },
    beforeCreate() {
        // this.$store.dispatch('setProducts');
        getProducts().then(
            resolve => {
                this.$store.commit('setProducts', resolve);
                // this.$set(this.$store.state, 'products', resolve);
            },
            reject => {
                alert(reject.error);
            }
        )
    }
});