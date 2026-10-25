package com.synclink.Controller;

import com.synclink.entity.Message;
import com.synclink.service.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/send")
    public Message sendMessage(@RequestBody Message message) {
        return messageService.sendMessage(message);
    }

    @GetMapping("/{user1}/{user2}")
    public List<Message> getConversation(
            @PathVariable Long user1,
            @PathVariable Long user2) {

        return messageService.getConversation(user1, user2);
    }

    @PostMapping("/group/send")
    public Message sendGroupMessage(@RequestBody Message message) {
        message.setConversationType("GROUP");
        return messageService.sendMessage(message);
    }

    @GetMapping("/group")
    public List<Message> getGroupMessages() {
        return messageService.getGroupMessages();
    }
}