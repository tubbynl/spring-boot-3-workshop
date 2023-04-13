package nl.chilit.spring.workshop;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@SpringBootApplication
public class Spring6WorkshopApplication {

    public static void main(String[] args) {
        SpringApplication.run(Spring6WorkshopApplication.class, args);
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @ControllerAdvice
    static class FancyProblemDetailsAdvice extends ResponseEntityExceptionHandler {
        @ExceptionHandler(TooManyItemsException.class)
        public ProblemDetail handleCustomException(TooManyItemsException tmi) {
            return ProblemDetail
                    .forStatusAndDetail(HttpStatus.BAD_REQUEST, tmi.getMaxItems()+" is the max jongeh");
        }

        @ExceptionHandler(CustomValidationException.class)
        public ProblemDetail handleCustomException(CustomValidationException cve) {
            return ProblemDetail
                    .forStatusAndDetail(HttpStatus.BAD_REQUEST, cve.getMessage());
        }
    }
}
