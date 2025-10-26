# Testing the Suggested Actions System

## 🧪 Quick Test Instructions

### Prerequisites
- All JavaScript files have been created successfully
- CSS has been updated with suggested actions styling
- Browser with developer tools (Chrome, Firefox, Safari)

### Integration Steps

**The suggested actions system is already integrated!** Just load the HTML file with these scripts in order:

```html
<!-- In your HTML head or before </body> -->

<!-- Core chat system (already exists) -->
<script src="js/ai-chat-premium.js"></script>

<!-- New suggested actions system -->
<script src="js/suggested-actions-system.js"></script>

<!-- Integration layer -->
<script src="js/ai-chat-premium-integrated.js"></script>
```

### Quick Test (5 minutes)

1. **Open the AI chat page** in your browser
2. **Open Browser Console** (F12 or Cmd+Option+I)
3. **Verify integration**:
   ```javascript
   // Should see this message in console:
   ✅ Suggested Actions System integrated successfully
   ```

4. **Test Token Analysis Context**:
   - Type: `"What's the price of BNB?"`
   - Send message
   - Wait for AI response
   - **Expected**: 3-4 suggestion buttons appear:
     - 📊 Show technical analysis
     - 📈 Price prediction
     - 🔍 Check smart contract
     - 💼 Add to portfolio

5. **Test Smart Contract Context**:
   - Type: `"Review this Solidity contract"`
   - Send message
   - Wait for AI response
   - **Expected**: Contract-specific suggestions:
     - ⚡ Optimize gas usage
     - 🔐 Security review
     - 🚀 Deployment guide
     - 🧪 Create test suite

6. **Click a Suggestion**:
   - Click any suggestion button
   - **Expected**:
     - Suggestion text appears in input field
     - Message is automatically sent
     - Previous suggestions disappear
     - New suggestions appear after AI response

### Visual Checks

✅ **Buttons appear** below AI responses
✅ **BNB gold theme** (#F3BA2F border/hover)
✅ **Smooth animations** (fade-in, bounce, ripple)
✅ **Proper alignment** (aligned with message content)
✅ **Mobile responsive** (stack vertically on small screens)

### Browser Console Debug Commands

```javascript
// Check if classes are loaded
typeof SuggestedActionsSystem
// → "function"

typeof HypeAIChatPremium.prototype.showSuggestedActions
// → "function"

// Get current chat instance
window.hypeAIChat

// Get suggested actions system
window.hypeAIChat.suggestedActions

// Manually trigger suggestions (after at least 2 messages)
window.hypeAIChat.showSuggestedActions()

// Get conversation context
window.hypeAIChat.suggestedActions.getConversationContext()
// → "tokenAnalysis" / "smartContract" / etc.

// Test context detection
const system = window.hypeAIChat.suggestedActions;
system.detectContext("What's the price of BTC?")
// → "tokenAnalysis"

system.detectContext("Review this Solidity contract")
// → "smartContract"

system.detectContext("I want to create a trading bot")
// → "tradingStrategy"
```

### Common Issues & Solutions

#### ❌ Suggestions Not Appearing

**Cause**: Scripts not loaded in correct order
**Solution**: Verify script load order:
1. ai-chat-premium.js (base)
2. suggested-actions-system.js (intelligence)
3. ai-chat-premium-integrated.js (integration)

**Cause**: JavaScript errors
**Solution**: Check console for errors, resolve any conflicts

#### ❌ Wrong Context Detected

**Cause**: Keywords not matching
**Solution**: Add more specific keywords in `suggested-actions-system.js`:
```javascript
this.contextKeywords = {
    smartContract: [
        'contract', 'solidity', 'deploy',
        // Add more specific keywords:
        'erc20', 'bep20', 'constructor', 'modifier'
    ]
}
```

#### ❌ Buttons Not Clickable

**Cause**: CSS z-index issue
**Solution**: Check `.suggested-actions` has proper z-index in CSS

#### ❌ Styling Looks Wrong

**Cause**: CSS not loaded or cached
**Solution**: Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Performance Metrics

Expected performance (measured in browser DevTools):

- **Context detection**: <1ms
- **Suggestion generation**: <1ms
- **Animation duration**: 0.5s
- **Total overhead**: ~10KB memory

### Success Criteria

Your integration is successful when:

1. ✅ No JavaScript errors in console
2. ✅ Integration message appears on page load
3. ✅ Suggestions appear after AI responses
4. ✅ Suggestions are contextually relevant
5. ✅ Clicking suggestions sends messages
6. ✅ Animations are smooth
7. ✅ Mobile layout works correctly

### Advanced Testing

#### Test All 8 Context Categories

```javascript
const testCases = [
    { input: "What's BNB price?", expected: "tokenAnalysis" },
    { input: "Write a function", expected: "codeGeneration" },
    { input: "Audit this contract", expected: "smartContract" },
    { input: "Create trading strategy", expected: "tradingStrategy" },
    { input: "Market trend analysis", expected: "marketAnalysis" },
    { input: "Yield farming guide", expected: "defiProtocol" },
    { input: "NFT collection stats", expected: "nftCollection" },
    { input: "Staking rewards", expected: "staking" }
];

const system = window.hypeAIChat.suggestedActions;
testCases.forEach(({ input, expected }) => {
    const result = system.detectContext(input);
    console.log(
        `${input.padEnd(30)} → ${result.padEnd(20)} ${result === expected ? '✅' : '❌'}`
    );
});
```

#### Test Suggestion Randomization

```javascript
// Get 10 sets of suggestions for same context
const message = "What's the price of BTC?";
const response = "BTC is currently at $45,000";

for (let i = 0; i < 10; i++) {
    const suggestions = window.hypeAIChat.suggestedActions.getSuggestions(message, response);
    console.log(`Set ${i + 1}:`, suggestions.map(s => s.text));
}
// Should see different suggestions each time (randomized from pool)
```

### Report Issues

If you encounter issues:

1. **Check console** for error messages
2. **Verify files** exist and are loaded
3. **Test context detection** with debug commands
4. **Try hard refresh** to clear cache
5. **Document the issue** with:
   - Browser and version
   - Console error messages
   - Steps to reproduce
   - Expected vs actual behavior

---

## 📊 Feature Checklist

After testing, verify all features work:

- [ ] Suggestions appear after AI responses
- [ ] 3-4 buttons per suggestion set
- [ ] Context-aware suggestions
- [ ] Click suggestions to send messages
- [ ] Previous suggestions disappear on new message
- [ ] BNB gold theme throughout
- [ ] Smooth animations (fade-in, bounce, ripple)
- [ ] Mobile responsive layout
- [ ] No JavaScript errors
- [ ] Performance <2ms per suggestion

---

**Ready to test?** Open your AI chat page and follow the steps above!
