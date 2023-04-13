package nl.chilit.spring.workshop;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * This is a service that loads default todos from an "API".
 * This is used to demonstrate the connection to an external service.
 */
@Service
public class DefaultsService {
    private final RestTemplate restTemplate;

    public DefaultsService(
        RestTemplateBuilder restTemplateBuilder,
        @Value("${defaults-api.url}") String defaultsApiUrl
    ) {
        this.restTemplate = restTemplateBuilder
            .rootUri(defaultsApiUrl)
            .build();
    }

    public TodoDefault[] getDefaults() {
        return restTemplate.getForObject("/task_defaults.json", TodoDefault[].class);
    }
}
