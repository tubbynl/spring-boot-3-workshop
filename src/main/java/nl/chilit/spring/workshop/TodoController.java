package nl.chilit.spring.workshop;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import javax.transaction.Transactional;
import java.util.List;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
public class TodoController {
    public static final int MAX_ITEMS_PER_PROJECT = 10;
    private final TodoRepository todoRepository;
    private final DefaultsService defaultsService;
    private final ModelMapper modelMapper;

    @GetMapping
    public List<Todo> getTodos() {
        return todoRepository.findAll();
    }

    @Transactional
    @PostMapping
    public void postTodo(@RequestBody Todo todo) {
        List<Todo> todos = todoRepository.findAll();

        if(todo.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title cannot be blank");
        }

        if (todos.size() >= MAX_ITEMS_PER_PROJECT) {
            throw new TooManyItemsException(MAX_ITEMS_PER_PROJECT);
        }

        todo.setId(null);
        todo.setTitle(todo.getTitle());
        todoRepository.save(todo);
    }

    @Transactional
    @PutMapping("/{id}")
    public void updateTodo(@PathVariable Long id, @RequestBody Todo update) {
        Todo todo = todoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        todo.setTitle(update.getTitle());
        todo.setDone(update.isDone());
    }

    @Transactional
    @DeleteMapping("/{id}")
    public void deleteTodo(@PathVariable Long id) {
        Todo todo = todoRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        todoRepository.delete(todo);
    }

    @Transactional
    @PostMapping("/add-defaults")
    public void addDefaults() {
        for (TodoDefault todoDefault : defaultsService.getDefaults()) {
            Todo todo = modelMapper.map(todoDefault, Todo.class);
            todoRepository.save(todo);
        }
    }
}
