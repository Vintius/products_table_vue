<template>
    <div class="tableUI"
         @click="closeSelector($event)">
        <div class="tableUI__content">
            <div class="tableUI__title">
                Table UI
            </div>
            <div class="tableUI__controls">
                <div class="tableUI__sorting">
                    <div class="tableUI__sortingLabel">
                        Sorting by:
                    </div>
                    <button class="tableUI__button"
                            :class="{isActive: sortKey === category.name}"
                            type="button"
                            v-for="(category, index) in categories"
                            v-show="isCategoryChecked(category.name)"
                            @click="sortKey = category.name">
                        {{ categoriesFormatted[index] }}
                    </button>
                </div>
                <div class="tableUI__navigations">
                    <button class="tableUI__button tableUI__button--border tableUI__button--delete js-deleteMulti"
                            :class="{notEmpty: toDelete.length}"
                            :disabled="!toDelete.length"
                            @click="confirmDeleteWindow($event)">
                        Delete{{ toDelete.length ? ' (' + toDelete.length + ')' : '' }}
                    </button>
                    <div class="tableUI__selectPerPageBox">
                        <select name="pagination"
                                class="tableUI__selectPerPage"
                                v-model="pageSize"
                                @change="pageNumber > pageCount - 1 ? pageNumber = pageCount - 1 : false">
                            <option :value=10>10 Per Page</option>
                            <option :value=15>15 Per Page</option>
                            <option :value=20>20 Per Page</option>
                        </select>
                    </div>
                    <div class="tableUI__pagination">
                        <button class="tableUI__button tableUI__button--border tableUI__button--arrow" type="button"
                                @click="prevPage"
                                :disabled="!pageNumber">
                            <img src="img/svg/arrow.svg" class="left">
                        </button>
                        <span class="tableUI__paginationText">
                                {{ paginatedData.start + 1 + '-' + paginatedData.end}} of {{ products.length }}
                            </span>
                        <button class="tableUI__button tableUI__button--border tableUI__button--arrow" type="button"
                                @click="nextPage"
                                :disabled="pageNumber >= pageCount - 1">
                            <img src="img/svg/arrow.svg">
                        </button>
                    </div>
                    <div class="tableUI__select" id="optionsList">
                        <button class="tableUI__button tableUI__button--border tableUI__button--selector"
                                @click="categoriesSelectOpened = !categoriesSelectOpened">
                            {{ categoriesChecked.length }} columns selected
                        </button>
                        <ul class="tableUI__optionList" v-if="categoriesSelectOpened">
                            <li>
                                <input class="tableUI__itemCheckbox"
                                       id="category_All"
                                       v-model="categoriesAll"
                                       type="checkbox"
                                       @input="$event.target.checked = true">
                                <label for="category_All" class="tableUI__itemLabel">
                                    <b>
                                        Select All
                                    </b>
                                </label>
                            </li>
                            <li v-for="(category, index) in categories">
                                <input class="tableUI__itemCheckbox"
                                       :id="'category_' + category.name"
                                       type="checkbox"
                                       v-model="categoriesChecked"
                                       :value='category.name'>
                                <label :for="'category_' + category.name" class="tableUI__itemLabel">
                                    {{ categoriesFormatted[index] }}
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <table class="tableUI__table">
                <thead class="tableUI__tableHeader">
                    <tr>
                        <input type="checkbox"
                               class="tableUI__itemCheckbox"
                               v-model="toDeleteAll"
                               @click="toDeleteAll ? toDelete = [] : 0"
                               id="inputCheckboxAll">
                        <label for="inputCheckboxAll" class="tableUI__itemLabel" />
                        <th v-for="category in sortedCategories"
                            :class="{reverted: sortOrders[category.name] < 0}"
                            v-show="isCategoryChecked(category.name)"
                            @click="category.name === sortKey ? sortOrder() : 0">
                                {{ categoriesFormatted[category.id] }}
                        </th>
                        <th />
                    </tr>
                </thead>
                <tbody class="tableUI__tableBody">
                    <tr v-for="product in paginatedData.data"
                        @click="toDelete.includes(product.id) ? toDelete.splice(toDelete.indexOf(product.id), 1) : toDelete.push(product.id)">
                        <input type="checkbox"
                               class="tableUI__itemCheckbox"
                               v-model="toDelete"
                               :value="product.id"
                               :id="'inputCheckbox_' + product.id">
                        <label :for="'inputCheckbox_' + product.id"
                               class="tableUI__itemLabel"
                               @click.prevent />
                        <td v-for="category in sortedCategories"
                            v-show="isCategoryChecked(category.name)"
                            :class="{bold: toDelete.includes(product.id)}">
                            {{ product[category.name] }}
                        </td>
                        <td>
                            <div class="tableUI__itemDelete js-deleteOne"
                                 @click.stop="confirmDeleteWindow($event, product)">
                                <img src="img/svg/trashcan.svg">
                                <span>delete</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="tableUI__confirmPopup" id="confirmPopup" v-show="confirmWindow">
                <div class="tableUI__confirmWindow">
                    <p class="tableUI__confirmText">
                        Are you sure you want to <b>delete item</b>?
                    </p>
                    <div class="tableUI__confirmButtons">
                        <button class="tableUI__confirmButton tableUI__confirmButton--white"
                                type="button"
                                @click="confirmWindow = false">
                            Cancel
                        </button>
                        <button class="tableUI__confirmButton tableUI__confirmButton--green"
                                type="button"
                                @click="$store.dispatch('deleteProducts', $store.state.deleteMode === 'one' ? toDeleteOne : $store.state.deleteMode === 'multi' ? toDelete : false)">
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// import {getProducts} from "../import/request";

    export default {
        name: "table_ui",
        data() {
          return {
              categoriesAll: false,
              categoriesChecked: [],
              categoriesSelectOpened: false,
              pageNumber: 0,
              pageSize: 10,
              sortOrders: {},
              sortKey: 'product',
              toDeleteAll: false,
              toDelete: [],
              toDeleteOne: '',
              confirmWindow: false,
              confirmWindowPos: {
                  x: 0,
                  y: 0
              }
          }
        },
        computed: {
            products: function () {
                return this.$store.state.products
            },
            categories: function () {
                if (this.products.length) {
                    return Object.keys(this.products[0])
                            .filter(item => item !== 'id')
                            .map((item, index) => {return {id: index, name: item}})
                }
                else {
                    return []
                }
            },
            sortedCategories: function() {
                if (this.categories.length) {
                    let categories = this.categories.slice(),
                        spliced = categories.splice(categories.find(item => item.name === this.sortKey).id, 1);

                    categories.splice(0, 0, spliced[0]);
                    return categories;
                }
            },
            categoriesFormatted: function() {
                        return this.categories.map(function (item) {
                            switch (item.name) {
                                case 'product':
                                    item = item.name + ' (100g serving)';
                                    break;
                                case 'fat':
                                case 'carbs':
                                case 'protein':
                                    item = item.name + ' (g)';
                                    break;
                                case 'iron':
                                    item = item.name + ' (%)';
                                    break;
                                default:
                                    item = item.name;
                            }
                            return item.charAt(0).toUpperCase() + item.slice(1);
                        });
            },
            pageCount() {
                let l = this.products.length,
                    s = this.pageSize;

                return Math.ceil(l/s);
            },
            paginatedData() {
                let start = this.pageNumber * this.pageSize,
                    end = start + this.pageSize;

                if (end > this.products.length) {
                    end = this.products.length
                }
                return {
                    start,
                    end,
                    data: this.sortedList.slice(start, end)
                };
            },
            sortedList () {
                let sortKey = this.sortKey,
                    order = this.sortOrders[sortKey] || 1,
                    products = this.products;

                if (sortKey) {
                    products = products.slice().sort(function(a, b) {
                        a = a[sortKey];
                        b = b[sortKey];
                        return (a === b ? 0 : a > b ? 1 : -1) * order;
                    });
                }
                return products;
            },
            confirmPopup() {
                return document.getElementById('confirmPopup');
            }
        },
        watch: {
            categoriesFormatted: function () {
                this.categoriesAll = true;
                this.categories.forEach(key => this.$set(this.sortOrders, key.name, 1));
            },
            categoriesChecked: function (newValue) {
                if (newValue.length < this.categoriesFormatted.length) {
                    this.categoriesAll = false
                }
                else if (newValue.length === this.categoriesFormatted.length) {
                    this.categoriesAll = true
                }
            },
            categoriesAll: function (newValue) {
                if (newValue && (this.categoriesChecked.length < this.categories.length)) {
                    this.categoriesChecked = this.categories.map(item => item.name);
                }
            },
            toDeleteAll: function (newValue) {
                if (newValue) {
                    this.toDelete = this.products.map(item => item.id);
                }
            },
            toDelete: function (newValue) {
                if (newValue.length < this.products.length) {
                    this.toDeleteAll = false;
                }
            },
            products: function () {
                    this.toDelete = [];
                    this.confirmWindow = false;
            }
        },
        methods: {
            debug(a,b,c) {
                debugger;
            },
            isCategoryChecked(category) {
                return this.categoriesChecked.some(item => item === category)
            },
            nextPage() {
                this.pageNumber++;
            },
            prevPage() {
                this.pageNumber--;
            },
            sortOrder() {
                this.sortOrders[this.sortKey] = this.sortOrders[this.sortKey] * -1;
            },
            confirmDeleteWindow(event, product) {
                this.confirmWindowPos.x = event.clientX - window.innerWidth/2;
                this.confirmWindowPos.y = event.clientY;
                this.confirmWindow = true;

                if (event.target.parentElement.classList.contains('js-deleteOne')) {
                    this.toDeleteOne = product.id;
                    this.$store.state.deleteMode = 'one';
                }
                else if (event.target.classList.contains('js-deleteMulti')){
                    this.$store.state.deleteMode = 'multi';
                }

                this.confirmPopup.style.top = this.confirmWindowPos.y + 'px';
                this.confirmPopup.style.left = 'calc(50% + ' + (this.confirmWindowPos.x - 160) + 'px)';
            },
            closeSelector(event) {
                !event.target.closest('#optionsList') ? this.categoriesSelectOpened = false : false;
            }
        },

    }
</script>