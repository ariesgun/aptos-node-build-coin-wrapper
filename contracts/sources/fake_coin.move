//:!:>moon
module WrapperCoin::prop_wrapper_coin {

    use aptos_framework::object::{Self, Object};
    use aptos_framework::fungible_asset::{Metadata};

    use tokenized_properties::controller;
    use std::type_info;
    use std::string::String;

    struct WrapperCoin { }

    fun init_module(sender: &signer) {
        let obj_address: Object<Metadata> = object::address_to_object(@fa_metadata);
        controller::create_coin_wrapper<WrapperCoin>(sender, obj_address);
    }

    #[view]
    public fun get_type_name(): String {
        type_info::type_name<WrapperCoin>()
    }
}
//<:!:moon