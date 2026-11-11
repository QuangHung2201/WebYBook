package com.webybook;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerCommerceApiSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void guestCannotAccessCustomerCartOrWishlistApis() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/wishlist"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminCannotAccessCustomerCartOrWishlistApis() throws Exception {
        mockMvc.perform(get("/api/v1/cart").with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/v1/wishlist").with(user("admin").roles("ADMIN")))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidCartQuantityReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/cart/items")
                        .with(user("customer").roles("CUSTOMER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bookId\":1,\"qty\":0}"))
                .andExpect(status().isBadRequest());
    }
}
